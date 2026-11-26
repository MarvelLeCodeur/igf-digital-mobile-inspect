import { Directory, File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';
import { API_BASE_URL, IGF_APP } from '../../../constants/config';
import { getAuthSession } from '../../../dry-module/dry-auth/context/auth-session';
import { dryMain } from '../../../dry-core/dry-service/dry-main.service';
import type { DryQueryResultsInterface } from '../../../dry-core/dry-model/dry-interface';
import type { RegistryItem } from '../../../shared/component/RegistryList/RegistryList';
import type { LocalEvidence } from '../../finding/service/capture.service';

export type MissionPiece = RegistryItem & {kind?:LocalEvidence['type']; createdAt?:string; bytes?:number; missionReference?:string};

export function getPage(page:number,missionId?:string,kind?:string,q?:string,findingId?:string) {
    return dryMain.getAll<DryQueryResultsInterface<MissionPiece>>({page,pageSize:20,missionId,kind,q,findingId},'/missions/evidence');
}

export async function uploadMissionPiece(missionId:string,file:LocalEvidence,findingId?:string) {
    const payload = new FormData();
    const input = Platform.OS === 'web' ? await fetch(file.uri).then(response => response.blob()) : new File(file.uri);
    // Même convention que Findit. Expo attend un vrai File pour lire l'URI native.
    payload.append('fileLoad',input,file.name);
    const query = new URLSearchParams({kind:file.type,...(findingId ? {findingId} : {})});
    return dryMain.create<{data:MissionPiece}>(payload,'/missions/'+encodeURIComponent(missionId)+'/evidence?'+query);
}

export async function openMissionPiece(piece:MissionPiece) {
    const {token,version} = getAuthSession();
    if (!token || !API_BASE_URL) throw new Error('Connectez-vous pour ouvrir cette pièce.');
    if (Platform.OS !== 'web' && !await isAvailableAsync()) throw new Error('Aucune application de partage n’est disponible.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),15_000);
    let bytes:ArrayBuffer;
    let mimeType:string|undefined;
    try {
        // La limite couvre aussi la réception du fichier, pas seulement les en-têtes.
        const response = await fetch(API_BASE_URL+'missions/evidence/'+encodeURIComponent(piece._id)+'/file',{
            headers:{Authorization:'Bearer '+token,'X-IGF-App':IGF_APP},signal:controller.signal,
        });
        if (response.status === 404) throw new Error('Ce justificatif est indisponible.');
        if (!response.ok) throw new Error('Impossible d’ouvrir ce justificatif.');
        mimeType = response.headers.get('content-type')?.split(';')[0];
        bytes = await response.arrayBuffer();
    } catch (error) {
        if (controller.signal.aborted) throw new Error('Le téléchargement a pris trop de temps. Réessaie.');
        throw error;
    } finally {
        clearTimeout(timer);
    }
    if (getAuthSession().version !== version) throw new Error('La session a changé.');
    const fileName = piece.title.replace(/[\\/:*?"<>|]/g,'_').replace(/^\.+/,'') || 'justificatif';
    if (Platform.OS === 'web') {
        const blob = new Blob([bytes],{type:mimeType});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url),1000);
        return;
    }

    const folder = new Directory(Paths.cache,'igf-justificatifs',piece._id);
    folder.create({intermediates:true,idempotent:true});
    const file = new File(folder,fileName);
    await file.write(bytes);
    await shareAsync(file.uri,{mimeType,dialogTitle:'Ouvrir le justificatif'});
}
