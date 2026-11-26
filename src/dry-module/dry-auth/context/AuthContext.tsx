import { useLiveUpdates } from '../../../shared/hook/useLiveUpdates';
import { createContext, useContext, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { resumeAllFindingPieces } from '../../../feature/evidence/service/pending-pieces.service';
import { useMissionScreen } from '../../../feature/mission/screen/useMissionScreen';

type Workspace = ReturnType<typeof useMissionScreen> & {liveRevision:number};
const Context = createContext<Workspace|null>(null);

export function AuthProvider({children}:PropsWithChildren) {
    // Garder la même session quand l’agent change d’écran.
    const workspace = useMissionScreen();
    const liveRevision = useLiveUpdates();
    useEffect(() => {
        if (!workspace.session || Platform.OS === 'web') return;
        let previous = AppState.currentState;
        const subscription = AppState.addEventListener('change', next => {
            // Quand l’agent revient dans Inspect, reprendre les dépôts qu’il a déjà lancés.
            if (next === 'active' && previous !== 'active') void resumeAllFindingPieces();
            previous = next;
        });
        return () => subscription.remove();
    },[workspace.session]);
    return <Context.Provider value={{...workspace,liveRevision}}>{children}</Context.Provider>;
}

export function useWorkspace() {
    const workspace = useContext(Context);
    if (!workspace) throw new Error('Le contexte IGF est manquant.');
    return workspace;
}
