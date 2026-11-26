import { useLoginScreen } from '../../../dry-module/dry-auth/screen/useLoginScreen';
import { useProfileScreen } from '../../../dry-module/dry-account/screen/useProfileScreen';
import { missionService } from '../service/mission.service';
import { useRef, useState, useSyncExternalStore } from 'react';
import { isAuthenticated, setAuthToken, subscribeAuthSession } from '../../../dry-module/dry-auth/context/auth-session';
import type { Mission } from '../../../dry-core/dry-model/dry-interface/mission.interface';
import type { Severity } from '../mission.constants';

export function useMissionScreen() {
    const session = useSyncExternalStore(subscribeAuthSession,isAuthenticated,isAuthenticated);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [selected, setSelected] = useState<Mission | null>(null);
    const [findingTitle, setFindingTitle] = useState('');
    const [findingText, setFindingText] = useState('');
    const [severity, setSeverity] = useState<Severity | null>(null);
    const pendingFinding = useRef<{ payload: string; key: string } | null>(null);
    const [feedback, setFeedback] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const { resetProfile,...profile } = useProfileScreen({session,busy,setBusy,setError,setFeedback});
    const login = useLoginScreen({busy,setBusy,setError,onConnected:connect});

    function connect(token:string) {
        clearSession();
        // L'accueil charge ses propres données. La navigation démarre dès que la session est ouverte.
        setAuthToken(token);
    }

    async function fetchPage(targetPage:number) {
        const result = await missionService.list(targetPage);
        setMissions(result.data);
        setPage(result.meta.page);
        setTotalPages(result.meta.totalPages);
    }

    async function load(targetPage: number) {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            await fetchPage(targetPage);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Connexion indisponible.');
        } finally { setBusy(false); }
    }

    async function open(mission: Mission) {
        if (!session || busy) return;
        setSelected(null);
        pendingFinding.current = null;
        setBusy(true);
        setError('');
        setFeedback('');
        setFindingTitle('');
        setFindingText('');
        setSeverity(null);
        try {
            const response = await missionService.detail(mission._id);
            setSelected(response.data);
            return response.data;
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Mission indisponible.');
        } finally { setBusy(false); }
    }

    async function submitWork(details:{category?:string;location?:string;notes?:string;submit?:boolean} = {}) {
        if (!session || !selected || busy) return;
        setBusy(true);
        setError('');
        setFeedback('');
        try {
            if (selected.status === 'EN_COURS' && selected.workPermissions?.createFinding && severity) {
                const input = { title:findingTitle.trim(), description:findingText.trim(), severity,...details };
                const payload = JSON.stringify(input);
                // Une réponse perdue ne doit pas créer un deuxième constat si l’agent réessaie.
                if (pendingFinding.current?.payload !== payload) {
                    const { data } = await missionService.findingOperationId(selected._id);
                    pendingFinding.current = { payload, key:data.id };
                }
                const {data} = await missionService.createFinding(selected._id, input, pendingFinding.current.key);
                pendingFinding.current = null;
                setFindingTitle('');
                setFindingText('');
                setSeverity(null);
                setFeedback(details.submit ? 'Constat soumis.' : 'Brouillon de constat enregistré.');
                return {findingId:data._id,missionId:selected._id};
            }
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Enregistrement indisponible.');
        } finally { setBusy(false); }
    }

    function signOut() {
        if (busy) return;
        clearSession();
    }

    function clearSession() {
        pendingFinding.current = null;
        setAuthToken(null);
        setMissions([]);
        setSelected(null);
        resetProfile();
        setFindingTitle('');
        setFindingText('');
        setSeverity(null);
        setFeedback('');
        setError('');
    }

    return {
        ...login, ...profile, session, missions, selected, setSelected, findingTitle,
        setFindingTitle, findingText, setFindingText, severity, setSeverity, feedback, page, totalPages, busy, error,
        load, open, submitWork, signOut, clearSession,
    };
}
