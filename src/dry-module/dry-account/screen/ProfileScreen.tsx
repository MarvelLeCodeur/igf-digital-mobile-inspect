import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from 'react-native';
import { FormScrollView } from '../../../shared/component/FormScrollView';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import type { IconName } from '../../../shared/component/RemixIcon';
import type { UserProfile } from '../../dry-user/model/dry-user.interface';
import { PrimaryAction } from '../../../shared/component/ScreenElements/ScreenElements';
import { pickProfilePhoto } from '../service/profile-photo.service';
import { styles } from './ProfileScreen.styles';

interface ProfileProps {
    profile: UserProfile;
    displayName: string;
    busy: boolean;
    setDisplayName: (value: string) => void;
    saveProfile: (avatar?:string | null) => Promise<boolean>;
    counts: Record<string, number> | null;
    summaryFailed: boolean;
    reloadSummary: () => void;
    onNotifications: () => void;
    onSecurity: () => void;
    unread: number | null;
    onSignOut: () => void;
    error: string;
    feedback: string;
}

export function ProfileScreen(props: ProfileProps) {
    const { profile, counts } = props;
    const [editing, setEditing] = useState(false);
    const [failedAvatar,setFailedAvatar] = useState<string | null>(null);
    const [photo,setPhoto] = useState<Awaited<ReturnType<typeof pickProfilePhoto>>>();
    const [picking,setPicking] = useState(false);
    const [photoError,setPhotoError] = useState('');
    const avatar = photo === undefined ? profile.avatar : photo?.uri;
    const changed = photo !== undefined || props.displayName.trim() !== profile.displayName;

    function closeEditor() {
        setPhoto(undefined);
        setPhotoError('');
        props.setDisplayName(profile.displayName);
        setEditing(false);
    }

    async function choosePhoto() {
        if (picking || props.busy) return;
        setPhotoError('');
        setPicking(true);
        try {
            const selection = await pickProfilePhoto();
            if (selection) setPhoto(selection);
        } catch (cause) {
            setPhotoError(cause instanceof Error ? cause.message : 'Impossible d’ouvrir la photothèque.');
        } finally { setPicking(false); }
    }

    async function save() {
        if (await props.saveProfile(photo === undefined ? undefined : photo?.data ?? null)) {
            setPhoto(undefined);
            setEditing(false);
        }
    }

    const initials = profile.displayName.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
    const contacts: {icon: IconName; label: string; value: string | undefined}[] = [
        {icon:'mail-line', label:'Adresse e-mail', value:profile.email},
        {icon:'phone-line', label:'Téléphone', value:profile.phone},
        {icon:'building-line', label:'Service', value:profile.department || profile.organizations.join(', ')},
    ];
    const assignments = [
        { label:'Missions', count:counts ? Object.values(counts).reduce((sum,count) => sum + count,0) : null, icon:'checkbox-circle-line', color:'#0959c7', tint:'#edf4ff' },
        { label:'À suivre', count:counts ? (counts.AUTORISEE ?? 0) + (counts.PLANIFIEE ?? 0) + (counts.EN_COURS ?? 0) + (counts.EN_REVUE ?? 0) : null, icon:'flag-line', color:'#986008', tint:'#fff6e6' },
        { label:'Non lues', count:props.unread, icon:'notification-3-line', color:'#b12d3c', tint:'#fff0f2' },
    ] as const;
    return (
        <FormScrollView contentContainerStyle={styles.content}>
            <View style={styles.identityCard}>
                <View style={styles.identity}>
                    <View style={styles.identityGlow} pointerEvents="none" accessible={false} />
                    <View style={styles.portrait}>
                        {avatar && avatar !== failedAvatar ? <Image source={{uri:avatar}} style={styles.avatar} accessibilityLabel="Photo de profil" onError={() => setFailedAvatar(avatar)} /> :
                            <View style={styles.avatar}><Text style={styles.initials}>{initials || 'IGF'}</Text></View>}
                        <Pressable accessibilityRole="button" accessibilityLabel="Choisir une photo de profil" accessibilityState={{expanded:editing,disabled:picking || props.busy}} disabled={picking || props.busy}
                            onPress={() => { setEditing(true); void choosePhoto(); }} hitSlop={6} style={({pressed}) => [styles.edit,pressed && styles.pressed]}>
                            <RemixIcon name="image-line" size={17} color="#fff" />
                        </Pressable>
                    </View>
                    <View style={styles.identityDetails}>
                        <Text accessibilityRole="header" style={styles.identityName}>{profile.displayName}</Text>
                        <View style={styles.role}>
                            <RemixIcon name="shield-check-line" size={15} color="#0758b3" />
                            <Text style={styles.identityRole}>{profile.jobTitle || 'Inspecteur'} · IGF</Text>
                        </View>
                        {profile.registrationNumber ? <Text style={styles.label}>Matricule · {profile.registrationNumber}</Text> : null}
                    </View>
                </View>
                {contacts.some(contact => contact.value) ? <View style={styles.rows}>
                    {contacts.filter(contact => contact.value).map(({icon,label,value}, index) => <View key={icon}
                        style={[styles.row,index > 0 && styles.divider]}>
                        <View style={styles.contactIcon}><RemixIcon name={icon} size={17} color="#17599b" /></View>
                        <View style={styles.contactDetails}>
                            <Text style={styles.contactLabel}>{label}</Text>
                            <Text selectable style={styles.rowText}>{value}</Text>
                        </View>
                    </View>)}
                </View> : null}
            </View>

            {props.error ? <Text accessibilityRole="alert" style={styles.error}>{props.error}</Text> : null}
            {props.feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{props.feedback}</Text> : null}
            {editing ? <View style={styles.card}>
                <Text style={styles.title}>Modifier mon profil</Text>
                <View style={styles.photoActions}>
                    <Pressable accessibilityRole="button" disabled={picking || props.busy} onPress={() => void choosePhoto()} style={styles.photoButton}>
                        {picking ? <ActivityIndicator color="#075cb9" /> : <RemixIcon name="image-line" size={19} color="#075cb9" />}
                        <Text style={styles.link}>{avatar ? 'Changer la photo' : 'Ajouter une photo'}</Text>
                    </Pressable>
                    {avatar ? <Pressable accessibilityRole="button" disabled={picking || props.busy} onPress={() => { setPhoto(null); setPhotoError(''); }} style={styles.removePhoto}>
                        <Text style={styles.error}>Retirer</Text>
                    </Pressable> : null}
                </View>
                {photoError ? <Text accessibilityRole="alert" style={styles.error}>{photoError}</Text> : null}
                <Text style={styles.label}>Nom d’affichage</Text>
                <TextInput editable={!props.busy} style={styles.input} accessibilityLabel="Nom d’affichage" value={props.displayName}
                    onChangeText={props.setDisplayName} maxLength={80} autoComplete="name" />
                <PrimaryAction label="Enregistrer" disabled={props.busy || picking || !changed || props.displayName.trim().length < 2}
                    onPress={() => void save()} />
                <Pressable accessibilityRole="button" onPress={closeEditor} disabled={props.busy || picking} style={styles.cancelEdit}>
                    <Text style={styles.link}>Annuler</Text>
                </Pressable>
            </View> : null}

            <View style={styles.stats}>
                <View style={styles.heading}>
                    <Text accessibilityRole="header" style={styles.title}>Mes statistiques</Text>
                </View>
                {counts ? <View style={styles.metrics}>
                    {assignments.map(item => <View key={item.label} style={[styles.metric,{backgroundColor:item.tint}]}>
                        <View style={styles.metricIcon}><RemixIcon name={item.icon} color={item.color} size={19} /></View>
                        <Text style={styles.count}>{item.count ?? '—'}</Text>
                        <Text style={styles.metricLabel}>{item.label}</Text>
                    </View>)}
                </View> : props.summaryFailed ? <Pressable accessibilityRole="button" onPress={props.reloadSummary}>
                    <Text style={styles.link}>Réessayer le chargement de la synthèse</Text>
                </Pressable> : <Text style={styles.label}>Chargement de la synthèse…</Text>}
            </View>

            <View style={styles.menu}>
                <Text accessibilityRole="header" style={styles.title}>Mon espace</Text>
                <View style={styles.menuGroup}>
                    <ProfileAction icon="user-line" label="Mon compte" onPress={() => editing ? closeEditor() : setEditing(true)} disabled={picking || props.busy} expanded={editing} />
                    <ProfileAction icon="shield-check-line" label="Sécurité" onPress={props.onSecurity} divided />
                    <ProfileAction icon="notification-3-line" label="Notifications" onPress={props.onNotifications} divided />
                </View>
                <ProfileAction icon="logout-box-r-line" label="Déconnexion" onPress={props.onSignOut} disabled={props.busy} danger />
            </View>
        </FormScrollView>
    );
}

function ProfileAction({icon,label,onPress,expanded,disabled,divided,danger}:{
    icon: IconName; label: string; onPress: () => void; expanded?: boolean; disabled?: boolean;
    divided?: boolean; danger?: boolean;
}) {
    return (
        <Pressable accessibilityRole="button" accessibilityState={{expanded,disabled}} onPress={onPress} disabled={disabled}
            style={({pressed}) => [styles.menuRow,divided && styles.divider,danger && styles.signOut,pressed && styles.pressed]}>
            <View style={[styles.menuIcon,danger && styles.signOutIcon]}>
                <RemixIcon name={icon} size={19} color={danger ? '#a3202c' : '#0959b0'} />
            </View>
            <Text style={[styles.rowText,danger && styles.error]}>{label}</Text>
            {!danger ? <RemixIcon name="arrow-right-s-line" color="#587394" size={21} /> : null}
        </Pressable>
    );
}
