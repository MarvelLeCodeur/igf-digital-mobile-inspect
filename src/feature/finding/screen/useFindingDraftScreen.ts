import { useRef, useState } from 'react';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { getPendingPieces, queueFindingPieces, resumeFindingPieces } from '../../evidence/service/pending-pieces.service';
import { getAuthSession } from '../../../dry-module/dry-auth/context/auth-session';
import { chooseEvidence } from '../service/capture.service';
import type { LocalEvidence } from '../service/capture.service';

export function useFindingDraftScreen() {
    const workspace = useWorkspace();
    const [step,setStep] = useState(0);
    const [category,setCategory] = useState('');
    const [location,setLocation] = useState('');
    const [notes,setNotes] = useState('');
    const [files,setFiles] = useState<LocalEvidence[]>([]);
    const [preview,setPreview] = useState<LocalEvidence|null>(null);
    const [error,setError] = useState('');
    const [saved,setSaved] = useState(false);
    const [sending,setSending] = useState(false);
    const [record,setRecord] = useState<{findingId:string;missionId:string}|null>(null);
    const submission = useRef(false);
    const retry = useRef<{findingId:string;missionId:string}|null>(null);
    const [picking,setPicking] = useState(false);

    async function pick(type:LocalEvidence['type']) {
        if (picking) return;
        setPicking(true);
        setError('');
        try {
            const file = await chooseEvidence(type);
            if (!file) return;
            if (file.bytes !== undefined && file.bytes > 5 * 1024 * 1024) throw new Error('La pièce dépasse 5 Mo.');
            setPreview(file);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Impossible d’ouvrir le fichier.');
        } finally { setPicking(false); }
    }
    function add() {
        if (preview) setFiles(items=>[...items,preview]);
        setPreview(null);
        setStep(2);
    }
    async function submit(send:boolean) {
        if (submission.current || saved) return;
        submission.current = true;
        setSending(true);
        setError('');
        const {version} = getAuthSession();
        try {
            if (!retry.current) {
                const result = await workspace.submitWork({
                    category:category || undefined,location:location.trim() || undefined,notes:notes.trim() || undefined,submit:send,
                });
                if (!result || getAuthSession().version !== version) return;
                retry.current = result;
                queueFindingPieces(result.findingId,result.missionId,files);
                setRecord(result);
            }
            // Le formulaire et le centre de synchronisation reprennent la même file.
            const id = retry.current.findingId;
            const complete = await resumeFindingPieces(id);
            if (getAuthSession().version !== version) return;
            const pending = getPendingPieces().find(item=>item.findingId===id);
            setFiles(pending?.files ?? []);
            if (complete) setSaved(true);
            else if (pending?.error) setError(pending.error);
        } catch(cause) {
            if (getAuthSession().version === version) {
                setError(cause instanceof Error ? cause.message : 'Le dépôt de la pièce a échoué.');
            }
        } finally {
            submission.current = false;
            setSending(false);
        }
    }

    return {workspace,step,setStep,category,setCategory,location,setLocation,notes,setNotes,files,setFiles,preview,setPreview,picking,pick,add,error,saved,record,sending,submit};
}
