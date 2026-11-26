import { Redirect, router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { FormScrollView } from '../../../shared/component/FormScrollView';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { FilterChips, PrimaryAction, ScreenRow } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { MissionQuestionnaire } from './MissionQuestionnaire';
import { useChecklistScreen } from './useChecklistScreen';

const tabs = [{value:'procedures',label:'Procédures'},{value:'objectives',label:'Objectifs'}];

export function ChecklistScreen() {
    const state = useChecklistScreen();
    if (!state.session) return <Redirect href="/login" />;
    const {selected,data,loading,error,mayRead,mayWrite,editing,saving} = state;
    const items = (state.tab==='procedures' ? data?.procedures : data?.objectives) ?? [];
    return (
        <MobileLayout active="missions" title="Programme de contrôle" back hideBar>
            <FormScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {!selected ? <PrimaryAction label="Choisir une mission" onPress={() => router.navigate('/missions')} /> : <>
                    <ScreenRow title={selected.title} subtitle={selected.reference ?? selected.entityName} icon="folder-3-line" />
                    {data ? <Text style={styles.body}>Version {data.version}</Text> : null}
                    {state.feedback ? <Text accessibilityLiveRegion="polite" style={styles.body}>{state.feedback}</Text> : null}
                    {!mayRead ? <Text style={styles.body}>Ton profil ne donne pas accès au programme.</Text> : null}
                    {loading ? <Text accessibilityLiveRegion="polite" style={styles.body}>Chargement du programme…</Text> : null}
                    {error ? <>
                        <Text style={styles.danger} accessibilityRole="alert">{error}</Text>
                        <PrimaryAction label="Réessayer" onPress={state.reload} />
                    </> : null}
                    {mayRead && !loading && !error && !editing ? <>
                        {data ? <>
                            <FilterChips items={tabs} value={state.tab} onChange={state.setTab} />
                            {items.map((item,index) => <ScreenRow key={index} title={item} icon="clipboard-line" />)}
                        </> : <Text style={styles.body}>Aucun programme enregistré pour cette mission.</Text>}
                        {mayWrite ? <PrimaryAction label={data ? 'Modifier le programme' : 'Créer le programme'} onPress={state.startEditing} /> : null}
                    </> : null}
                    {mayRead && !editing ? <MissionQuestionnaire key={selected._id} missionId={selected._id} /> : null}
                    {editing ? <>
                        <Text style={styles.section}>Objectifs</Text>
                        <Text style={styles.body}>Un objectif par ligne, de 1 à 20. Maximum 500 caractères par ligne.</Text>
                        <TextInput multiline editable={!saving} accessibilityLabel="Objectifs" textAlignVertical="top"
                            style={[styles.formField,{minHeight:100}]} value={state.objectives} onChangeText={state.setObjectives} />
                        <Text style={styles.section}>Procédures</Text>
                        <Text style={styles.body}>Une procédure par ligne, de 1 à 30. Maximum 1 000 caractères par ligne.</Text>
                        <TextInput multiline editable={!saving} accessibilityLabel="Procédures" textAlignVertical="top"
                            style={[styles.formField,{minHeight:120}]} value={state.procedures} onChangeText={state.setProcedures} />
                        {state.saveError ? <>
                            <Text accessibilityRole="alert" style={styles.danger}>{state.saveError}</Text>
                            <PrimaryAction label="Abandonner la saisie et recharger" disabled={saving} onPress={state.reload} />
                        </> : null}
                        <View style={styles.chips}>
                            <PrimaryAction label={saving ? 'Enregistrement…' : 'Enregistrer'} disabled={!state.canSave} onPress={() => void state.save()} />
                            <PrimaryAction label="Annuler" disabled={saving} onPress={() => state.setEditing(false)} />
                        </View>
                    </> : null}
                </>}
            </FormScrollView>
        </MobileLayout>
    );
}
