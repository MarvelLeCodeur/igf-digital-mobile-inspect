import { getAuthSession, subscribeAuthSession } from '../../../dry-module/dry-auth/context/auth-session';
import type { LocalEvidence } from '../../finding/service/capture.service';
import { uploadMissionPiece } from './evidence.service';

interface PendingPieces {
    findingId:string;
    missionId:string;
    files:LocalEvidence[];
    busy:boolean;
    error:string;
}

let entries:PendingPieces[] = [];
const listeners = new Set<() => void>();

function update(next:PendingPieces[]) {
    entries = next;
    listeners.forEach(listener=>listener());
}

// Les chemins temporaires appartiennent à la session courante et sont oubliés à sa fermeture.
subscribeAuthSession(() => update([]));

export function subscribePendingPieces(listener:() => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function getPendingPieces() { return entries; }

export function queueFindingPieces(findingId:string,missionId:string,files:LocalEvidence[]) {
    if (!getAuthSession().token || !files.length || entries.some(item=>item.findingId===findingId)) return;
    update([...entries,{findingId,missionId,files:[...files],busy:false,error:''}]);
}

export async function resumeFindingPieces(findingId:string) {
    const job = entries.find(item=>item.findingId===findingId);
    const {token,version} = getAuthSession();
    if (!token || job?.busy) return false;
    if (!job) return true;
    const current = () => getAuthSession().version === version;
    const replace = (changes:Partial<PendingPieces>) => update(entries.map(item=>item.findingId===findingId ? {...item,...changes} : item));
    replace({busy:true,error:''});
    try {
        let remaining = job.files;
        while (remaining.length) {
            const [file,...next] = remaining;
            await uploadMissionPiece(job.missionId,file,job.findingId);
            if (!current()) return false;
            remaining = next;
            // Retirer une pièce uniquement après confirmation du serveur.
            replace({files:remaining});
        }
        update(entries.filter(item=>item.findingId!==findingId));
        return true;
    } catch (cause) {
        if (current()) replace({busy:false,error:cause instanceof Error ? cause.message : 'Dépôt indisponible.'});
        return false;
    }
}

let activeBatch:Promise<void>|null = null;

export function resumeAllFindingPieces() {
    if (activeBatch) return activeBatch;
    const {token,version} = getAuthSession();
    if (!token || !entries.length) return Promise.resolve();
    const ids = entries.map(item=>item.findingId);
    activeBatch = Promise.resolve().then(async()=>{
        // La reprise s’arrête si la session a changé entre deux dossiers.
        for (const id of ids) {
            if (getAuthSession().version !== version) break;
            await resumeFindingPieces(id);
        }
    }).finally(()=>{ activeBatch=null; });
    return activeBatch;
}
