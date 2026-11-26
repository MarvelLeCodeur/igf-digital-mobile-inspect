import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { useListPagination } from '../../../shared/hook/useListPagination';
import { getPage } from '../service/evidence.service';

export function useEvidenceScreen(missionId?:string,findingId?:string) {
    const {session} = useWorkspace();
    const [filter,setFilter] = useState('all');
    const [query,setQuery] = useState('');
    const [search,setSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setSearch(query.trim()),250);
        return () => clearTimeout(timer);
    },[query]);
    // Le serveur applique la catégorie à toutes les pages du registre.
    const fetchPage = useCallback((page:number) => getPage(page,missionId,filter === 'all' ? undefined : filter,search,findingId),[missionId,filter,search,findingId]);
    const state = useListPagination(session,fetchPage);
    const {load} = state;
    const latestLoad = useRef(load);
    useEffect(() => { latestLoad.current = load; },[load]);
    const opened = useRef(false);
    useFocusEffect(useCallback(() => {
        // Le premier chargement vient de useListPagination. Au retour du dépôt, actualiser.
        if (session && opened.current) void latestLoad.current();
        opened.current = session;
    },[session]));
    return {session,state,filter,setFilter,query,setQuery};
}
