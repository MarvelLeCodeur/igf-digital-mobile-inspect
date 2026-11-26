import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { useListPagination } from '../../../shared/hook/useListPagination';
import { missionService } from '../service/mission.service';

export function useMissionList(initialStatus:'DEFAULT' | 'EN_COURS') {
    const workspace = useWorkspace();
    const [q,setQuery] = useState('');
    const [search,setSearch] = useState('');
    const [status,setStatus] = useState<string>(initialStatus);
    useEffect(() => {
        const timer = setTimeout(() => setSearch(q.trim()),250);
        return () => clearTimeout(timer);
    },[q]);
    const request = useCallback((page:number) => missionService.search(page,search,status === 'DEFAULT' ? '' : status),[search,status]);
    return {workspace,q,setQuery,status,setStatus,...useListPagination(workspace.session,request)};
}
