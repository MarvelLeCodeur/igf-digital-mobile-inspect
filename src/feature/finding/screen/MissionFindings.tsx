import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { FilterChips, PrimaryAction, ScreenRow, SearchField } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { useListPagination } from '../../../shared/hook/useListPagination';
import { missionService } from '../../mission/service/mission.service';
import { severities } from '../../mission/mission.constants';

const statusOptions = [{value:'',label:'Tous'},{value:'BROUILLON',label:'Brouillons'},{value:'SOUMIS',label:'Soumis'}];

export function MissionFindings({missionId}:{missionId:string}) {
    const [text,setText] = useState('');
    const [search,setSearch] = useState('');
    const [status,setStatus] = useState('');
    const [severity,setSeverity] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setSearch(text.trim()),250);
        return () => clearTimeout(timer);
    },[text]);

    const fetchPage = useCallback((page:number) => missionService.findings(missionId,page,search,status,severity),[missionId,search,status,severity]);
    const {list,busy,error,load} = useListPagination(true,fetchPage);
    const latestLoad = useRef(load);
    useEffect(() => { latestLoad.current = load; },[load]);
    const opened = useRef(false);
    useFocusEffect(useCallback(() => {
        // Actualiser au retour du formulaire pour afficher le constat qui vient d’être enregistré.
        if (opened.current) void latestLoad.current();
        opened.current = true;
    },[]));
    const page = list?.meta.page ?? 1;
    const pages = list?.meta.totalPages ?? 0;
    return <>
        <Text accessibilityRole="header" style={styles.section}>Constats de la mission</Text>
        <SearchField value={text} onChange={setText} placeholder="Titre, observation ou catégorie" />
        <FilterChips items={statusOptions} value={status} onChange={setStatus} />
        <FilterChips items={[{value:'',label:'Toutes les gravités'},...severities]} value={severity} onChange={setSeverity} />
        {busy ? <Text style={styles.body} accessibilityLiveRegion="polite">Chargement des constats…</Text> : null}
        {error ? <>
            <Text accessibilityRole="alert" style={styles.danger}>{error}</Text>
            <PrimaryAction label="Réessayer" onPress={() => void load(page)} />
        </> : null}
        {list?.data.map(item => {
            const severity = severities.find(option => option.value === item.severity)?.label ?? item.severity;
            const state = statusOptions.find(option => option.value === item.status)?.label ?? item.status;
            return <View key={item._id}>
                <ScreenRow title={item.title} subtitle={[item.category,severity].filter(Boolean).join(' · ')}
                    badge={item.status === 'BROUILLON' ? 'Brouillon' : state} icon="clipboard-line" />
                <Text style={styles.body}>{item.description}</Text>
                {item.location ? <Text style={styles.body}>Lieu · {item.location}</Text> : null}
                {item.notes ? <Text style={styles.body}>Notes · {item.notes}</Text> : null}
                <PrimaryAction label="Pièces du constat" onPress={() => router.push({
                    pathname:'/evidence',params:{missionId,findingId:item._id},
                })} />
            </View>;
        })}
        {!busy && !error && list && !list.data.length ? <Text style={styles.body}>Aucun constat ne correspond à cette vue.</Text> : null}
        {pages > 1 ? <View style={styles.chips}>
            <PrimaryAction label="Précédente" disabled={busy || page<=1} onPress={() => void load(page-1)} />
            <Text style={styles.body}>Page {page} sur {pages}</Text>
            <PrimaryAction label="Suivante" disabled={busy || page>=pages} onPress={() => void load(page+1)} />
        </View> : null}
    </>;
}
