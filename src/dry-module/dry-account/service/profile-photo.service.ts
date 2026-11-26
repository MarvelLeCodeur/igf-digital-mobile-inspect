import { launchImageLibraryAsync } from 'expo-image-picker';

export async function pickProfilePhoto() {
    // Le recadrage natif permet de cadrer le visage avant d'afficher l'aperçu.
    const result = await launchImageLibraryAsync({
        mediaTypes:['images'], allowsEditing:true, aspect:[1,1], base64:true, quality:.55,
    });
    if (result.canceled) return null;
    const photo = result.assets[0];
    if (!photo.base64) throw new Error('Cette photo ne peut pas être lue.');
    if (photo.base64.length > 2_999_900 || photo.width * photo.height > 25_000_000) {
        throw new Error('Cette photo est trop grande. Choisissez une image plus légère.');
    }
    return { uri:photo.uri, data:'data:image/jpeg;base64,' + photo.base64 };
}
