import { Redirect } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { useAgendaScreen } from './useAgendaScreen';
import { styles } from './AgendaScreen.styles';

export function AgendaScreen() {
    const {session} = useWorkspace();
    const {selected,setSelected,days,moveWeek} = useAgendaScreen();
    if (!session) return <Redirect href="/login" />;
    return (
        <MobileLayout active="missions" title="Agenda des visites" back hideBar>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.month}>
                    <Pressable accessibilityLabel="Semaine précédente" accessibilityRole="button" onPress={() => moveWeek(-1)}><RemixIcon name="arrow-left-s-line" /></Pressable>
                    <Text style={styles.title}>{selected.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</Text>
                    <Pressable accessibilityLabel="Semaine suivante" accessibilityRole="button" onPress={() => moveWeek(1)}><RemixIcon name="arrow-right-s-line" /></Pressable>
                </View>
                <View style={styles.week}>
                    {days.map(date => {
                        const active = date.toDateString()===selected.toDateString();
                        return <Pressable key={date.toISOString()} accessibilityRole="button" accessibilityState={{selected:active}}
                            onPress={() => setSelected(date)} style={[styles.date,active && styles.selected]}>
                            <Text style={[styles.text,active && styles.white]}>{date.toLocaleDateString('fr-FR',{weekday:'short'})}</Text>
                            <Text style={[styles.text,active && styles.white]}>{date.getDate()}</Text>
                        </Pressable>;
                    })}
                </View>
                <Text style={styles.title}>Visites du {selected.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</Text>
                <Text style={styles.note}>Le planning des visites n’est pas encore disponible sur l’API IGF Digital.</Text>
            </ScrollView>
        </MobileLayout>
    );
}
