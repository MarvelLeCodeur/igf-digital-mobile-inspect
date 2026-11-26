import { useRef, useState, useSyncExternalStore } from 'react';
import { getPendingPieces, subscribePendingPieces, resumeFindingPieces, resumeAllFindingPieces } from '../../evidence/service/pending-pieces.service';
import { useHomeScreen } from '../../home/screen/useHomeScreen';
import { useToast } from '../../../shared/component/ToastProvider';

// Titre commun à tous les toasts de cet écran.
const toastTitle = 'Synchronisation';

// Nombre total de fichiers encore en attente, tous dossiers confondus.
function countPendingFiles() {
    return getPendingPieces().reduce((sum,job) => sum + job.files.length,0);
}

// Texte « 1 fichier » / « 3 fichiers » avec l'accord correct.
function filesLabel(count:number) {
    return count + (count > 1 ? ' fichiers' : ' fichier');
}

// Texte « 1 fichier envoyé » / « 3 fichiers envoyés ».
function sentLabel(count:number) {
    return filesLabel(count) + (count > 1 ? ' envoyés' : ' envoyé');
}

export function useSyncScreen() {
    const state = useHomeScreen();
    const toast = useToast();
    const jobs = useSyncExternalStore(subscribePendingPieces,getPendingPieces,getPendingPieces);
    const [last,setLast] = useState<Date|null>(null);
    const [resuming,setResuming] = useState(false);
    const batch = useRef(false);

    // Actualise les données du périmètre et prévient l'utilisateur du résultat.
    async function sync() {
        if (state.refreshing) return;
        // Une actualisation incomplète ne doit pas être présentée comme une synchronisation réussie.
        if (await state.refresh()) {
            setLast(new Date());
            toast('success','Vos données ont été actualisées.',toastTitle);
        } else {
            // Le message vient de refresh ; le texte par défaut couvre le cas d'une session absente.
            toast('error',state.lastError.current || 'Actualisation indisponible. Réessayez.',toastTitle);
        }
    }

    // Reprend le dépôt d'un seul dossier et prévient l'utilisateur du résultat.
    async function resumeOne(findingId:string) {
        // Nombre de fichiers du dossier avant la reprise, pour annoncer combien sont partis.
        const before = getPendingPieces().find(job => job.findingId === findingId)?.files.length ?? 0;
        if (await resumeFindingPieces(findingId)) {
            if (before) toast('success',sentLabel(before) + '.',toastTitle);
            return;
        }
        // En cas d'échec, le service garde le message d'erreur dans le dossier concerné.
        const job = getPendingPieces().find(item => item.findingId === findingId);
        // Un dossier déjà en cours de dépôt n'est pas une erreur : aucun toast dans ce cas.
        if (job && !job.busy) toast('error',job.error || 'Dépôt indisponible. Réessayez.',toastTitle);
    }

    // Reprend tous les dépôts en attente, puis résume ce qui est parti et ce qui reste.
    async function resumeAll() {
        if (batch.current) return;
        batch.current = true;
        setResuming(true);
        const before = countPendingFiles();
        try {
            await resumeAllFindingPieces();
            const remaining = countPendingFiles();
            const sent = before - remaining;
            if (!remaining) {
                if (sent) toast('success',sentLabel(sent) + '.',toastTitle);
            } else if (sent) {
                // Envoi partiel : on précise ce qu'il reste pour que l'utilisateur relance.
                toast('warning',sentLabel(sent) + '. ' + filesLabel(remaining) + ' en attente : réessayez.',toastTitle);
            } else {
                toast('error','Aucun fichier n’a pu être envoyé. Vérifiez votre connexion et réessayez.',toastTitle);
            }
        } finally { batch.current = false; setResuming(false); }
    }

    return {...state,last,sync,jobs,resumeOne,resuming,resumeAll};
}
