import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { missionService } from '../../mission/service/mission.service';
import { getHomeTotals } from '../service/home.service';
import type { HomeTotals } from '../service/home.service';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';

export function useHomeScreen() {
    const workspace = useWorkspace();
    const { session } = workspace;
    const [active,setActive] = useState<number | null>(null);
    const [totals,setTotals] = useState<HomeTotals|null>(null);
    const [refreshing,setRefreshing] = useState(false);
    const [updated,setUpdated] = useState(false);
    const [error,setError] = useState('');
    const revision = useRef(0);


    const refresh = useCallback(async () => {
        if (!session) return false;
        const request = ++revision.current;
        setRefreshing(true);
        setError('');
        try {
            // Le compteur suit le meme perimetre que la liste des missions.
            const [summary, analytics] = await Promise.allSettled([missionService.summary(), getHomeTotals()]);
            if (request !== revision.current) return false;
            setActive(summary.status === 'fulfilled' ? summary.value.data.EN_COURS ?? 0 : null);
            if (summary.status === 'rejected') throw summary.reason;
            if (analytics.status === 'rejected') throw analytics.reason;
            setTotals(analytics.value.data);
            setUpdated(true);
            return true;
        } catch (cause) {
            if (request === revision.current) {
                setUpdated(false);
                setError(cause instanceof Error ? cause.message : 'Actualisation indisponible.');
            }
            return false;
        } finally {
            if (request === revision.current) setRefreshing(false);
        }
    },[session]);

    const invalidate = useCallback(() => { revision.current++; },[]);

    useFocusEffect(useCallback(() => {
        if (!session) return;
        const start = setTimeout(() => void refresh(),0);
        // Ignorer une réponse reçue après la fermeture de l’écran ou de la session.
        return () => { clearTimeout(start); invalidate(); };
    },[session,refresh,invalidate]));

    function openMissions(status?:'EN_COURS') {
        workspace.setSelected(null);
        router.replace(status ? {pathname:'/missions',params:{status}} : '/missions');
    }

    return {workspace, active, totals, refreshing, updated, error, refresh, openMissions};
}
