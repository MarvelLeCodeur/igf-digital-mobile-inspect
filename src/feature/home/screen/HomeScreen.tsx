import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { styles } from './HomeScreen.styles';
import { useHomeScreen } from './useHomeScreen';

export function HomeScreen() {
    const { workspace, active, refreshing, error, refresh, openMissions, updated } = useHomeScreen();
    // Photo de profil de l'utilisateur ; l'icône sert de repli si elle est absente ou ne charge pas.
    const avatar = workspace.profile?.avatar ?? null;
    const [failedAvatar,setFailedAvatar] = useState<string | null>(null);
    if (!workspace.session) return <Redirect href="/login" />;

    const links = [
        { title:'Mes missions', icon:'scan-2-line', open:() => openMissions(), featured:true },
        { title:'Fiche de constat', icon:'clipboard-line', open:() => router.navigate('/findings') },
        { title:'Pièces justificatives', icon:'image-line', open:() => router.push('/evidence') },
        { title:'Synchronisation', icon:'cloud-line', open:() => router.push('/sync'), synced:!!updated && !error },
    ] as const;

    return (
        <MobileLayout active="home" landing>
            <ScrollView contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}>
                <Text style={styles.subtitle}>Application de terrain —{'\n'}Missions et constats</Text>
                <View style={styles.welcome}>
                    <Image source={require('../../../../assets/inspect-home-wave.png')} style={styles.welcomeRibbon} resizeMode="stretch" accessible={false} />
                    <View style={styles.welcomeIcon}>
                        {avatar && avatar !== failedAvatar
                            ? <Image source={{uri:avatar}} style={styles.welcomeAvatar} accessibilityLabel="Photo de profil" onError={() => setFailedAvatar(avatar)} />
                            : <RemixIcon name="user-line" size={28} color="#073b9e" />}
                    </View>
                    <View style={styles.welcomeDivider} />
                    <View style={styles.heading}><Text style={styles.title}>Bienvenue !</Text><Text style={styles.caption}>Sur IGF Inspect</Text></View>
                </View>
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                <Pressable accessibilityRole="button" style={[styles.row,styles.activeRow]} onPress={() => openMissions('EN_COURS')}>
                    <View style={styles.icon}><RemixIcon name="clipboard-line" color="#0756d4" size={29} /></View>
                    <View style={styles.divider} />
                    {active !== null && active > 0 ? <View style={styles.dot} /> : null}
                    {refreshing && active === null ? <ActivityIndicator size="small" color="#0755bd" /> : null}
                    <Text style={styles.label}>{active === null ? 'Missions en cours' : active + (active === 1 ? ' mission en cours' : ' missions en cours')}</Text>
                    <RemixIcon name="arrow-right-s-line" size={24} color="#234879" />
                </Pressable>
                {links.map(link => {
                    const featured = 'featured' in link;
                    const synced = 'synced' in link && link.synced;
                    return <Pressable key={link.title} accessibilityRole="button" onPress={link.open}
                        style={({pressed}) => [styles.row,featured && styles.featured,pressed && styles.pressed]}>
                        <View style={[styles.icon,featured && styles.featuredIcon]}><RemixIcon name={link.icon} size={32} color={featured ? '#fff' : '#006bdc'} /></View>
                        <View style={[styles.divider,featured && styles.featuredDivider]} />
                        <Text style={[styles.label,featured && styles.white]}>{link.title}</Text>
                        <RemixIcon name={synced ? 'checkbox-circle-fill' : 'arrow-right-s-line'} size={25} color={synced ? '#258444' : featured ? '#fff' : '#132454'} />
                    </Pressable>;
                })}
            </ScrollView>
        </MobileLayout>
    );
}
