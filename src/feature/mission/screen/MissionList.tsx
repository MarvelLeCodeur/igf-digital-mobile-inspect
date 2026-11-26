import { FormScrollView } from '../../../shared/component/FormScrollView';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SearchField, FilterChips, PrimaryAction } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { missionStatusLabels } from '../mission.constants';
import { useMissionList } from './useMissionList';

const filters = [
    {value:'DEFAULT',label:'Toutes'},{value:'EN_COURS',label:'En cours'},{value:'PLANIFIEE',label:'Planifiées'},{value:'TERMINEE',label:'Clôturées'},
];

export function MissionList({initialStatus}:{initialStatus:'DEFAULT' | 'EN_COURS'}) {
    const {workspace,q,setQuery,status,setStatus,list,busy,error,load} = useMissionList(initialStatus);
    const page = list?.meta.page ?? 1;
    const pages = list?.meta.totalPages ?? 0;
    return (
        <FormScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void load(page)} />}>
            <View style={layout.heading}>
                <Text accessibilityRole="header" style={layout.title}>Mes missions</Text>
                <Text style={layout.subtitle}>Liste et suivi de vos missions de contrôle</Text>
            </View>
            <SearchField value={q} onChange={setQuery} placeholder="Intitulé ou référence de mission" />
            <FilterChips items={filters} value={status} onChange={setStatus} />
            {error ? <Text accessibilityRole="alert" style={styles.danger}>{error}</Text> : null}
            {list?.data.map(mission => {
                const status = mission.status;
                const active = status === 'EN_COURS';
                const planned = status === 'PLANIFIEE';
                const color = active ? '#20794c' : planned ? '#0959c7' : '#415372';
                return <Pressable key={mission._id} accessibilityRole="button" style={layout.row}
                    onPress={() => { if (!workspace.busy) void workspace.open(mission); }}>
                    <View style={[layout.icon,active && layout.activeIcon,planned && layout.plannedIcon]}>
                        <RemixIcon name={active ? 'file-text-line' : planned ? 'calendar-line' : 'clipboard-line'}
                            color={active ? '#c33640' : planned ? '#9a6600' : '#0959c7'} size={23} />
                    </View>
                    <View style={layout.details}>
                        {mission.reference ? <Text style={layout.reference}>{mission.reference}</Text> : null}
                        <Text style={layout.name}>{mission.title}</Text>
                        {mission.entityName ? <View style={layout.entity}><RemixIcon name="government-line" size={13} />
                            <Text style={layout.subtitle}>{mission.entityName}</Text></View> : null}
                    </View>
                    <Text style={[layout.badge,{color,backgroundColor:active ? '#e3f5ea' : '#eaf0fa'}]}>{missionStatusLabels[status] ?? status}</Text>
                    <RemixIcon name="arrow-right-s-line" size={16} />
                </Pressable>;
            })}
            {!busy && !error && !list?.data.length ? <Text style={styles.body}>Aucun dossier dans cette vue.</Text> : null}
            {pages > 1 ? <View style={styles.chips}>
                <Text style={styles.body}>Page {page} sur {pages}</Text>
                <PrimaryAction label="Précédente" disabled={busy || page===1} onPress={() => void load(page-1)} />
                <PrimaryAction label="Suivante" disabled={busy || page>=pages} onPress={() => void load(page+1)} />
            </View> : null}
        </FormScrollView>
    );
}

const layout = StyleSheet.create({
    heading:{alignItems:'center',gap:3},
    title:{color:'#122452',fontSize:24,fontWeight:'800'},
    subtitle:{color:'#445d80',fontSize:12,flexShrink:1},
    row:{minHeight:76,flexDirection:'row',alignItems:'center',gap:8,borderRadius:13,padding:9,backgroundColor:'#f8fbff',borderWidth:1,borderColor:'#e2eaf8',elevation:2},
    icon:{width:40,height:40,borderRadius:10,backgroundColor:'#e8f1ff',alignItems:'center',justifyContent:'center'},
    activeIcon:{backgroundColor:'#fff0f0'},
    plannedIcon:{backgroundColor:'#fff6df'},
    details:{flex:1,gap:2},
    reference:{color:'#142650',fontSize:12,fontWeight:'800'},
    name:{color:'#142650',fontSize:13,fontWeight:'600'},
    entity:{flexDirection:'row',alignItems:'center',gap:3},
    badge:{fontSize:10,fontWeight:'700',borderRadius:7,paddingHorizontal:5,paddingVertical:4},
});
