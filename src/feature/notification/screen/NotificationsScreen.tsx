import { FormScrollView } from '../../../shared/component/FormScrollView';
import { Redirect } from 'expo-router';
import { Text, RefreshControl, View } from 'react-native';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { FilterChips, PrimaryAction, ScreenRow, SearchField } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { useNotificationsScreen } from './useNotificationsScreen';

const filters = [{value:'',label:'Toutes'},{value:'true',label:'Non lues'}];

export function NotificationsScreen() {
    const state = useNotificationsScreen();
    if (!state.session) return <Redirect href="/login" />;
    const page = state.list?.meta.page ?? 1;
    const pages = state.list?.meta.totalPages ?? 0;
    const item = state.selected;
    const current = state.list?.data ?? [];
    return (
        <MobileLayout active="notifications" title={item ? 'Détail de la notification' : 'Notifications'} hideBar={!!item}>
            <FormScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={state.busy} onRefresh={() => void state.load(page)} />}>
                {state.error ? <Text accessibilityRole="alert" style={styles.danger}>{state.error}</Text> : null}
                {item ? <>
                    <ScreenRow icon="notification-3-line" title={item.title} subtitle={item.missionTitle} badge={item.isRead ? undefined : 'Non lue'} />
                    <Text style={styles.section}>Informations</Text>
                    <Text style={styles.body}>{item.description}</Text>
                    <PrimaryAction label="Retour à la liste" onPress={() => state.setSelected(null)} />
                </> : <>
                    <SearchField value={state.text} onChange={state.setText} placeholder="Rechercher une notification" />
                    <FilterChips items={filters} value={state.filter} onChange={state.setFilter} />
                    {current.map(item => <ScreenRow key={item._id} icon="notification-3-line" title={item.title} subtitle={item.missionTitle} badge={item.isRead ? undefined : 'Non lue'}
                        onPress={() => void state.open(item)} />)}
                    {!state.busy && !state.error && !current.length ? <Text style={styles.body}>Aucune notification dans cette vue.</Text> : null}
                    {pages > 1 ? <View style={styles.chips}>
                        <Text style={styles.body}>Page {page} sur {pages}</Text>
                        <PrimaryAction label="Précédente" disabled={state.busy || page<=1} onPress={() => void state.load(page-1)} />
                        <PrimaryAction label="Suivante" disabled={state.busy || page>=pages} onPress={() => void state.load(page+1)} />
                    </View> : null}
                </>}
            </FormScrollView>
        </MobileLayout>
    );
}
