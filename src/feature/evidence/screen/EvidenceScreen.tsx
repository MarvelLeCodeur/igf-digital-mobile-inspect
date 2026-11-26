import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { FilterChips, PrimaryAction, SearchField } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles as ui } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { openMissionPiece } from '../service/evidence.service';
import { useEvidenceScreen } from './useEvidenceScreen';

const filters = [
    {value:'all',label:'Toutes'}, {value:'photo',label:'Photos'}, {value:'document',label:'Documents'}, {value:'scan',label:'Scans'},
];

function fileKind(reference:string) {
    if (/\bscan[\s_.-]/i.test(reference)) return 'scan';
    if (/\.(jpe?g|png|webp|heic)$/i.test(reference)) return 'photo';
    if (/\.(pdf|xlsx?|docx?|csv|txt)$/i.test(reference)) return 'document';
    return 'reference';
}

export function EvidenceScreen() {
    const {missionId,findingId} = useLocalSearchParams<{missionId?:string;findingId?:string}>();
    const {session,state,filter,setFilter,query,setQuery} = useEvidenceScreen(missionId,findingId);
    const [opening,setOpening] = useState(false);
    const [openError,setOpenError] = useState('');
    if (!session) return <Redirect href="/" />;
    const page = state.list?.meta.page ?? 1;
    const pages = state.list?.meta.totalPages ?? 0;
    const entries = state.list?.data ?? [];
    return (
        <MobileLayout active="findings">
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}
                refreshControl={<RefreshControl refreshing={state.busy} onRefresh={() => void state.load(page)} />}>
                <View style={styles.heading}>
                    <View style={styles.icon}><RemixIcon name="image-line" color="#0869d2" size={25} /></View>
                    <View style={styles.details}>
                        <Text accessibilityRole="header" style={styles.title}>Pièces justificatives</Text>
                        <Text style={styles.caption}>{findingId ? 'Pièces rattachées au constat' : 'Documents et références du périmètre'}</Text>
                    </View>
                </View>
                <SearchField value={query} onChange={setQuery} placeholder="Nom du fichier" />
                <FilterChips items={filters} value={filter} onChange={setFilter} />
                {state.error || openError ? <Text accessibilityRole="alert" style={ui.danger}>{openError || state.error}</Text> : null}
                {/* Le total vient du serveur et tient compte des filtres sur toutes les pages. */}
                {!state.busy && !state.error && typeof state.list?.meta.total === 'number' ? <Text style={ui.body}>{state.list.meta.total} pièce(s)</Text> : null}
                {state.error ? <PrimaryAction label="Recharger les pièces" disabled={state.busy} onPress={() => void state.load(page)} /> : null}
                {entries.map(item => {
                    const kind = item.kind ?? fileKind(item.title);
                    const label = kind === 'photo' ? 'Photo' : kind === 'scan' ? 'Scan' : item.title.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toUpperCase() ?? 'Référence';
                    return <Pressable key={item._id} style={styles.row} accessibilityRole="button" disabled={opening}
                        accessibilityLabel={'Ouvrir '+item.title} onPress={async () => {
                            setOpenError('');
                            setOpening(true);
                            try { await openMissionPiece(item); }
                            catch (cause) { setOpenError(cause instanceof Error ? cause.message : 'Ouverture indisponible.'); }
                            finally { setOpening(false); }
                        }}>
                        <View style={styles.icon}><RemixIcon name={kind === 'photo' ? 'image-line' : 'file-text-line'} color="#0959c7" size={24} /></View>
                        <View style={styles.details}><Text selectable style={styles.name}>{item.title}</Text>
                            {item.detail ? <Text style={styles.caption}>{[item.missionReference,item.detail].filter(Boolean).join(" · ")}</Text> : null}
                            {item.bytes ? <Text style={styles.caption}>{Math.max(1,Math.round(item.bytes / 1024))} Ko</Text> : null}
                        </View>
                        <Text style={styles.tag}>{label}</Text>
                        <RemixIcon name="arrow-right-s-line" size={18} />
                    </Pressable>;
                })}
                {!state.busy && !state.error && !entries.length ? <Text style={ui.body}>Aucune pièce dans cette vue.</Text> : null}
                {pages > 1 ? <View style={ui.chips}>
                    <PrimaryAction label="Précédente" disabled={state.busy || page <= 1} onPress={() => void state.load(page-1)} />
                    <Text style={ui.body}>{page} / {pages}</Text>
                    <PrimaryAction label="Suivante" disabled={state.busy || page >= pages} onPress={() => void state.load(page+1)} />
                </View> : null}
                <PrimaryAction label="Ajouter une pièce justificative" onPress={() => router.push({pathname:'/add-evidence',params:{...(missionId ? {missionId} : {}),...(findingId ? {findingId} : {})}})} />
            </ScrollView>
        </MobileLayout>
    );
}

const styles = StyleSheet.create({
    heading:{flexDirection:'row',alignItems:'center',gap:10},
    title:{fontSize:22,fontWeight:'800',color:'#132454'},
    caption:{color:'#405778',fontSize:12},
    icon:{width:43,height:43,borderRadius:10,backgroundColor:'#e5f0ff',alignItems:'center',justifyContent:'center'},
    details:{flex:1,gap:2},
    row:{flexDirection:'row',alignItems:'center',gap:9,minHeight:68,padding:9,borderRadius:13,borderWidth:1,borderColor:'#dce7f7',backgroundColor:'#f8fbff',elevation:2},
    name:{fontSize:14,fontWeight:'700',color:'#132454'},
    tag:{padding:5,borderRadius:6,color:'#0959c7',backgroundColor:'#e9f3ff',fontSize:10,fontWeight:'700'},
});
