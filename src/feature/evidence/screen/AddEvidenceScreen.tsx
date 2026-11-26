import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { PrimaryAction, ScreenRow, SearchField } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles as ui } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { useListPagination } from '../../../shared/hook/useListPagination';
import { missionService } from '../../mission/service/mission.service';
import type { Mission } from '../../../dry-core/dry-model/dry-interface/mission.interface';
import { chooseEvidence } from '../../finding/service/capture.service';
import type { LocalEvidence } from '../../finding/service/capture.service';
import { uploadMissionPiece } from '../service/evidence.service';

export function AddEvidenceScreen() {
    const {missionId,findingId} = useLocalSearchParams<{missionId?:string;findingId?:string}>();
    const {session,selected} = useWorkspace();
    const [manual,setManual] = useState(false);
    const [pickedMission,setPickedMission] = useState<Mission|null>(null);
    const [requested,setRequested] = useState<{id:string;mission:Mission|null}|null>(null);
    const [text,setText] = useState('');
    const [search,setSearch] = useState('');
    const current = selected && selected._id === missionId && selected.status === 'EN_COURS'
        && selected.workPermissions?.createFinding ? selected : null;
    const loadingMission = !!missionId && !manual && !current && requested?.id !== missionId;
    const mission = manual ? pickedMission : current ?? (requested?.id === missionId ? requested?.mission ?? null : null);
    useEffect(() => {
        if (!session || !missionId || manual || current) return;
        let active = true;
        // Vérifier le dossier par l’API lorsque l’écran est ouvert sans mission en mémoire.
        void missionService.detail(missionId).then(({data}) => {
            if (active) setRequested({id:missionId,mission:data.status === 'EN_COURS' && data.workPermissions?.createFinding ? data : null});
        }).catch(() => { if (active) setRequested({id:missionId,mission:null}); });
        return () => { active=false; };
    },[session,missionId,manual,current]);
    useEffect(() => {
        const timer = setTimeout(() => setSearch(text.trim()),250);
        return () => clearTimeout(timer);
    },[text]);
    const [file,setFile] = useState<LocalEvidence | null>(null);
    const [busy,setBusy] = useState(false);
    const [error,setError] = useState('');
    const [saved,setSaved] = useState(false);
    const findMissions = useCallback((page:number) => missionService.forFinding(page,search),[search]);
    const state = useListPagination(session && !mission && !loadingMission,findMissions);
    if (!session) return <Redirect href="/login" />;
    const page = state.list?.meta.page ?? 1;
    const pages = state.list?.meta.totalPages ?? 0;

    async function pick(kind:LocalEvidence['type']) {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            const result = await chooseEvidence(kind);
            if (!result) return;
            // Éviter un transfert inutile lorsque le sélecteur fournit déjà la taille.
            if (result.bytes !== undefined && result.bytes > 5 * 1024 * 1024) {
                setFile(null);
                setError('Le fichier dépasse la limite de 5 Mo.');
                return;
            }
            setFile(result);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Impossible d’ouvrir le fichier.');
        } finally { setBusy(false); }
    }

    async function save() {
        if (!mission || !file || busy) return;
        setBusy(true);
        setError('');
        try {
            // Préserver le lien au constat seulement dans le dossier qui l’a ouvert.
            await uploadMissionPiece(mission._id,file,mission._id === missionId ? findingId : undefined);
            setSaved(true);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Le dépôt a échoué.');
        } finally { setBusy(false); }
    }

    return (
        <MobileLayout active="findings" title="Ajouter une pièce" back>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
                {saved ? <>
                    <ScreenRow title="Pièce ajoutée" subtitle={mission?.title} icon="checkbox-circle-line" color="#218449" />
                    <PrimaryAction label="Retour aux pièces justificatives" onPress={() => router.canGoBack() ? router.back() : router.replace({pathname:'/evidence',params:mission ? {missionId:mission._id,...(findingId && mission._id === missionId ? {findingId} : {})} : {}})} />
                </> : <>
                    <View style={styles.panel}>
                        <Text accessibilityRole="header" style={ui.title}>{mission ? 'Ajouter un justificatif' : 'Choisir la mission'}</Text>
                        {findingId && mission?._id === missionId ? <Text style={ui.body}>La pièce sera rattachée au constat ouvert.</Text> : null}
                        <Text style={ui.body}>{mission?.title ?? 'Sélectionnez la mission en cours à laquelle rattacher la pièce.'}</Text>
                    </View>
                    {error || state.error ? <Text accessibilityRole="alert" style={ui.danger}>{error || state.error}</Text> : null}
                    {loadingMission ? <Text style={ui.body}>Vérification de la mission…</Text> : !mission ? <>
                        {missionId && !manual ? <Text style={ui.body}>Choisis une mission en cours accessible pour déposer la pièce.</Text> : null}
                        <SearchField value={text} onChange={setText} placeholder="Intitulé ou référence de mission" />
                        {state.list?.data.map(item => <ScreenRow key={item._id} title={item.title} subtitle={[item.reference,item.entityName].filter(Boolean).join(" · ")}
                            icon="file-list-3-line" badge="En cours" onPress={() => { setError('');setPickedMission(item);setManual(true); }} />)}
                        {!state.busy && state.list && !state.list.data.length ? <Text style={ui.body}>Aucune mission en cours affectée à votre compte ou à votre équipe.</Text> : null}
                        {pages > 1 ? <View style={ui.chips}>
                            <PrimaryAction label="Précédente" disabled={state.busy || page <= 1} onPress={() => void state.load(page-1)} />
                            <Text style={ui.body}>{page} / {pages}</Text>
                            <PrimaryAction label="Suivante" disabled={state.busy || page >= pages} onPress={() => void state.load(page+1)} />
                        </View> : null}
                    </> : <>
                        <Text style={ui.body}>Formats acceptés : PDF, Word (DOCX), JPEG ou PNG, jusqu’à 5 Mo.</Text>
                        <PrimaryAction label="Prendre une photo" disabled={busy} onPress={() => void pick('photo')} />
                        <PrimaryAction label="Choisir une image ou un scan" disabled={busy} onPress={() => void pick('scan')} />
                        <PrimaryAction label="Importer un document" disabled={busy} onPress={() => void pick('document')} />
                        {file ? <>
                            <ScreenRow title={file.name} icon="file-text-line" />
                            {file.type !== 'document' ? <Image style={styles.preview} source={{uri:file.uri}} resizeMode="contain" accessibilityLabel="Aperçu du justificatif" /> : null}
                            <PrimaryAction label={busy ? 'Dépôt en cours…' : 'Ajouter à la mission'} disabled={busy} onPress={() => void save()} />
                        </> : null}
                        <PrimaryAction label="Changer de mission" disabled={busy} onPress={() => { setPickedMission(null);setManual(true);setError(''); }} />
                    </>}
                </>}
            </ScrollView>
        </MobileLayout>
    );
}

const styles = StyleSheet.create({
    panel:{backgroundColor:'#e8f2ff',borderRadius:15,padding:14,gap:5},
    preview:{height:200,width:'100%',borderRadius:12,backgroundColor:'#edf3fc'},
});
