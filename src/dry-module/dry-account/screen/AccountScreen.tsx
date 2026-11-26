import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { Action } from '../../../shared/component/Action';
import { useWorkspace } from '../../dry-auth/context/AuthContext';
import { useNotificationInbox } from '../../../feature/notification/screen/NotificationInbox';
import { missionService } from '../../../feature/mission/service/mission.service';
import { useSignOutConfirmation } from './useSignOutConfirmation';
import { ProfileScreen } from './ProfileScreen';
import { styles } from './ProfileScreen.styles';

export function AccountScreen() {
    const state = useWorkspace();
    const [counts, setCounts] = useState<Record<string, number> | null>(null);
    const {unread} = useNotificationInbox();
    const {requestSignOut,confirmation} = useSignOutConfirmation();
    const [summaryFailed, setSummaryFailed] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (state.session) void state.openProfile();
        // Charger une fois a l'ouverture de la route pour cette session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.session]);

    useEffect(() => {
        if (!state.session) return;
        let active = true;
        setCounts(null);
        setSummaryFailed(false);
        // La synthese utilise le perimetre complet autorise par l'API, toutes pages confondues.
        missionService.summary().then(({data}) => {
            if (active) setCounts(data);
        }, () => {
            if (active) setSummaryFailed(true);
        });
        return () => { active = false; };
    }, [state.session,retry]);

    if (!state.session) return <Redirect href="/" />;
    return (
        <MobileLayout active="profile" title="Profil">
            {state.profile ? <ProfileScreen profile={state.profile} displayName={state.displayName} busy={state.busy}
                setDisplayName={state.setDisplayName} saveProfile={state.saveProfile} counts={counts}
                summaryFailed={summaryFailed} reloadSummary={() => setRetry(value => value + 1)}
                error={state.error} feedback={state.feedback} onSignOut={requestSignOut}
                onSecurity={() => router.push('/settings')} onNotifications={() => router.push('/notifications')} unread={unread} /> :
                <View style={styles.content}>
                    {state.error ? <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text> : null}
                    {state.busy ? <ActivityIndicator color="#0959c7" accessibilityLabel="Chargement du profil" /> :
                        <Action label="Charger le profil" onPress={() => void state.openProfile()} />}
                </View>}
            {confirmation}
        </MobileLayout>
    );
}
