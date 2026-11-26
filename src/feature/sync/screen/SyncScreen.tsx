import { Redirect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { PrimaryAction, ScreenRow } from '../../../shared/component/ScreenElements/ScreenElements';
import { useSyncScreen } from './useSyncScreen';
import { styles } from './SyncScreen.styles';

export function SyncScreen() {
    const {workspace,last,sync,updated,refreshing,error,jobs,resumeOne,resuming,resumeAll} = useSyncScreen();
    if (!workspace.session) return <Redirect href="/login" />;
    return (
        <MobileLayout active="home" title="Synchronisation" back>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <RemixIcon name="cloud-line" color="#095ed1" size={65} />
                    <Text style={styles.title}>Centre de synchronisation</Text>
                    <Text style={styles.text}>Actualisez les données de votre périmètre de contrôle.</Text>
                </View>
                <ScreenRow title="Pièces en attente" subtitle={jobs.length ? jobs.reduce((sum,job)=>sum+job.files.length,0)+' fichier(s)' : 'Aucun fichier à reprendre'} icon="time-line" />
                {jobs.length>1 ? <PrimaryAction label={resuming ? 'Reprise en cours…' : 'Reprendre tous les dépôts'}
                    disabled={resuming || jobs.some(job=>job.busy)} onPress={()=>void resumeAll()} /> : null}
                {jobs.map(job=><View key={job.findingId} style={{gap:8}}>
                    <Text style={styles.text}>{job.files.map(file=>file.name).join(', ')}</Text>
                    {job.error ? <Text accessibilityRole="alert" style={styles.error}>{job.error}</Text> : null}
                    <PrimaryAction label={job.busy ? 'Dépôt en cours…' : 'Reprendre le dépôt'} disabled={job.busy}
                        // La reprise d'un dossier affiche un toast de succès ou d'erreur à la fin.
                        onPress={()=>void resumeOne(job.findingId)} />
                </View>)}
                <ScreenRow title="Dernière synchronisation" subtitle={updated && last ? last.toLocaleString('fr-FR') : 'Aucune actualisation manuelle réussie'} icon="checkbox-circle-line" />
                <ScreenRow title="Mode hors ligne" subtitle="Les pièces en attente restent disponibles tant que l’application et la session restent ouvertes." icon="wifi-off-line" />
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                <PrimaryAction label={refreshing ? 'Actualisation…' : 'Synchroniser maintenant'} disabled={refreshing} onPress={() => void sync()} />
            </ScrollView>
        </MobileLayout>
    );
}
