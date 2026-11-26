import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export interface LocalEvidence {name:string;uri:string;bytes?:number;type:'photo'|'document'|'scan'}

export async function chooseEvidence(type:LocalEvidence['type']):Promise<LocalEvidence|null> {
    if (type === 'document') {
        const result = await DocumentPicker.getDocumentAsync({type:['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png'],copyToCacheDirectory:true});
        if (result.canceled) return null;
        const file = result.assets[0];
        return {type,name:file.name,uri:file.uri,bytes:file.size};
    }
    if (type === 'photo' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
        throw new Error('Autorisez l’accès à l’appareil photo pour continuer.');
    }
    const picker = type === 'photo' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await picker({mediaTypes:['images'],quality:.85});
    if (result.canceled) return null;
    const file = result.assets[0];
    return {type,name:file.fileName || file.uri.split('/').pop() || 'Image',uri:file.uri,bytes:file.fileSize};
}
