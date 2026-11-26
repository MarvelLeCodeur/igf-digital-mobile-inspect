import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { styles } from './FindingScreen.styles';
import { useFindingScreen } from './useFindingScreen';

export function FindingScreen() {
    const {session,missions,busy,loaded,error,page,totalPages,load,selectMission} = useFindingScreen();
    if (!session) return <Redirect href="/" />;
    return (
        <MobileLayout active="findings">
            <ScrollView contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={loaded && busy} onRefresh={() => void load(page)} tintColor="#075cc5" />}>
                <View style={styles.hero}>
                    <View style={styles.heroIcon}><RemixIcon name="clipboard-line" color="#fff" size={25} /></View>
                    <View style={styles.heroText}>
                        <Text accessibilityRole="header" style={styles.title}>Fiche de constat</Text>
                        <Text style={styles.subtitle}>Choisissez une mission en cours pour créer un constat.</Text>
                    </View>
                </View>

                {error ? <View style={styles.errorPanel}>
                    <RemixIcon name="error-warning-line" color="#ac263a" size={21} />
                    <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
                    <Pressable accessibilityRole="button" disabled={busy} onPress={() => void load(page)} style={styles.retry}>
                        <Text style={styles.link}>Réessayer</Text>
                    </Pressable>
                </View> : null}

                {!loaded && !error ? <View style={styles.empty}>
                    <ActivityIndicator color="#075cc5" />
                    <Text style={styles.support}>Chargement des missions…</Text>
                </View> : null}

                {missions.length ? <Text accessibilityRole="header" style={styles.sectionTitle}>Missions disponibles</Text> : null}
                {missions.map(mission => (
                    <Pressable key={mission._id} accessibilityRole="button"
                        accessibilityLabel={['Créer un constat',mission.reference,mission.title,mission.entityName].filter(Boolean).join(' · ')}
                        disabled={busy} onPress={() => void selectMission(mission)}
                        style={({pressed}) => [styles.card,pressed && styles.pressed]}>
                        <View style={styles.cardHeading}>
                            <View style={styles.missionIcon}><RemixIcon name="file-list-3-line" color="#075cc5" size={23} /></View>
                            <View style={styles.missionDetails}>
                                {mission.reference ? <Text style={styles.reference}>{mission.reference}</Text> : null}
                                <Text style={styles.missionTitle}>{mission.title}</Text>
                                {mission.entityName ? <View style={styles.entity}>
                                    <RemixIcon name="government-line" color="#536b8c" size={14} />
                                    <Text style={styles.support}>{mission.entityName}</Text>
                                </View> : null}
                            </View>
                        </View>
                        <View style={styles.cardFooter}>
                            <View style={styles.badge}>
                                <View style={styles.dot} /><Text style={styles.badgeText}>En cours</Text>
                            </View>
                            <View style={styles.cardAction}>
                                <Text style={styles.link}>Créer un constat</Text>
                                <RemixIcon name="arrow-right-s-line" color="#075cc5" size={20} />
                            </View>
                        </View>
                    </Pressable>
                ))}

                {loaded && !busy && !error && !missions.length ? <View style={styles.empty}>
                    <View style={styles.missionIcon}><RemixIcon name="folder-3-line" color="#075cc5" size={24} /></View>
                    <Text style={styles.emptyTitle}>Aucune mission en cours</Text>
                    <Text style={[styles.support,styles.center]}>Aucune mission en cours n’est affectée à votre compte ou à votre équipe.</Text>
                    <Pressable accessibilityRole="button" onPress={() => router.navigate('/missions')} style={styles.retry}>
                        <Text style={styles.link}>Voir mes missions</Text>
                    </Pressable>
                </View> : null}

                {totalPages > 1 ? <View style={styles.pages}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Page précédente"
                        disabled={busy || page <= 1} onPress={() => void load(page-1)}
                        style={[styles.pageButton,page <= 1 && styles.disabled]}>
                        <RemixIcon name="arrow-left-s-line" color="#075cc5" size={21} />
                    </Pressable>
                    <Text style={styles.support}>Page {page} sur {totalPages}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Page suivante"
                        disabled={busy || page >= totalPages} onPress={() => void load(page+1)}
                        style={[styles.pageButton,page >= totalPages && styles.disabled]}>
                        <RemixIcon name="arrow-right-s-line" color="#075cc5" size={21} />
                    </Pressable>
                </View> : null}
            </ScrollView>
        </MobileLayout>
    );
}
