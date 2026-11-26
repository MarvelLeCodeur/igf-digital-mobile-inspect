import { useState } from 'react';
import { router } from 'expo-router';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { useListPagination } from '../../../shared/hook/useListPagination';
import { missionService } from '../../mission/service/mission.service';
import type { Mission } from '../../../dry-core/dry-model/dry-interface/mission.interface';

export function useFindingScreen() {
    const workspace = useWorkspace();
    const {list,busy,error,load} = useListPagination(workspace.session,missionService.forFinding);
    const [selectionError,setSelectionError] = useState('');

    async function selectMission(mission:Mission) {
        setSelectionError('');
        // Le detail revérifie le droit avant d'ouvrir le formulaire.
        const opened = await workspace.open(mission);
        if (!opened || opened.status !== 'EN_COURS' || !opened.workPermissions?.createFinding) {
            setSelectionError(workspace.error || 'Cette mission ne permet plus de créer un constat.');
            await load(list?.meta.page ?? 1);
            return;
        }
        router.push({pathname:'/new-finding',params:{missionId:mission._id}});
    }
    return {session:workspace.session,missions:list?.data ?? [],loaded:list !== null,page:list?.meta.page ?? 1,totalPages:list?.meta.totalPages ?? 0,
        busy:busy || workspace.busy,error:selectionError || error,load:async (page?:number) => { setSelectionError(''); await load(page); },selectMission};
}
