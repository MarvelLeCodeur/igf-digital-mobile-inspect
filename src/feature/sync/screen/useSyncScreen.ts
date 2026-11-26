import { useRef, useState, useSyncExternalStore } from 'react';
import { getPendingPieces, subscribePendingPieces, resumeFindingPieces, resumeAllFindingPieces } from '../../evidence/service/pending-pieces.service';
import { useHomeScreen } from '../../home/screen/useHomeScreen';

export function useSyncScreen() {
    const state = useHomeScreen();
    const jobs = useSyncExternalStore(subscribePendingPieces,getPendingPieces,getPendingPieces);
    const [last,setLast] = useState<Date|null>(null);
    const [resuming,setResuming] = useState(false);
    const batch = useRef(false);
    async function sync() {
        if (state.refreshing) return;
        // Une actualisation incomplète ne doit pas être présentée comme une synchronisation réussie.
        if (await state.refresh()) setLast(new Date());
    }
    async function resumeAll() {
        if (batch.current) return;
        batch.current = true;
        setResuming(true);
        try {
            await resumeAllFindingPieces();
        } finally { batch.current = false; setResuming(false); }
    }
    return {...state,last,sync,jobs,resumeFindingPieces,resuming,resumeAll};
}
