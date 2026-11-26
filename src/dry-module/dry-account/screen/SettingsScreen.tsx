import { Redirect, router } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { useSignOutConfirmation } from './useSignOutConfirmation';
import { useWorkspace } from '../../dry-auth/context/AuthContext';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { ScreenRow } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from './SettingsScreen.styles';

export function SettingsScreen() {
    const {session} = useWorkspace();
    const {requestSignOut,confirmation} = useSignOutConfirmation();
    if (!session) return <Redirect href="/login" />;
    return (
        <MobileLayout active="settings" title="Paramètres" back>
            <ScrollView contentContainerStyle={styles.content}>

                <ScreenRow title="Langue de l’application" subtitle="Français (RDC)" icon="file-text-line" />
                <ScreenRow title="Thème d’affichage" subtitle="Clair" icon="eye-line" />
                <ScreenRow title="Synchronisation" subtitle="Actualisation des données de terrain" icon="refresh-line" onPress={() => router.push('/sync')} />

                <Text style={styles.section}>Sécurité</Text>
                <ScreenRow title="Accès au compte" subtitle="Les habilitations sont gérées par votre administrateur" icon="shield-check-line" />
                <ScreenRow title="Aide & assistance" subtitle="Questions fréquentes et informations" icon="question-line" onPress={() => router.push('/help')} />
                <ScreenRow title="Déconnexion" icon="lock-line" color="#bf2833" onPress={requestSignOut} />
            </ScrollView>
            {confirmation}
        </MobileLayout>
    );
}
