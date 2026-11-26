import { Redirect, router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useWorkspace } from '../context/AuthContext';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { MobileHero, RdcRibbon } from '../../../shared/component/MobileHero/MobileHero';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { PrimaryAction } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from './FirstAccessScreen.styles';

export function FirstAccessScreen() {
    const { session, profile } = useWorkspace();
    if (!session) return <Redirect href="/login" />;
    return (
        <MobileLayout active="home" title="IGF Inspect" showTabs={false}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                <MobileHero />
                <View style={styles.sheet}>
                    <View style={styles.inner}>
                        <View style={styles.welcome}>
                            <RemixIcon name="checkbox-circle-fill" color="#16834b" size={34} />
                            <View style={styles.heading}>
                                <Text accessibilityRole="header" style={styles.title}>Bienvenue dans IGF Inspect !</Text>
                                <Text style={styles.caption}>Votre connexion a réussi.</Text>
                            </View>
                        </View>
                        <View style={styles.panel}>
                            <View style={styles.panelHeader}><RemixIcon name="user-line" color="#0959c7" size={19} />
                                <Text style={styles.panelTitle}>Profil inspecteur</Text></View>
                            {profile ? <View style={styles.panelRow}><Text style={styles.caption}>Nom</Text>
                                <Text style={styles.value}>{profile.displayName}</Text></View> : null}
                            <View style={styles.panelRow}><Text style={styles.caption}>Fonction</Text>
                                <Text style={styles.value}>{profile?.jobTitle || 'Inspecteur'}</Text></View>
                        </View>
                        <View style={styles.panel}>
                            <View style={styles.panelHeader}><RemixIcon name="shield-check-line" color="#0959c7" size={19} />
                                <Text style={styles.panelTitle}>Accès à votre espace</Text></View>
                            <Text style={[styles.caption,styles.note]}>Retrouvez vos missions, constats et pièces justificatives selon vos habilitations.</Text>
                        </View>
                        <View style={styles.actions}>
                            <PrimaryAction label="Commencer" onPress={() => router.replace('/')} />
                        </View>
                    </View>
                </View>
                <RdcRibbon />
            </ScrollView>
        </MobileLayout>
    );
}
