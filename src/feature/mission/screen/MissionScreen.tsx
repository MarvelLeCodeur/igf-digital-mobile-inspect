import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { MissionFindings } from '../../finding/screen/MissionFindings';
import { MissionHistory } from './MissionHistory';
import { MissionList } from './MissionList';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { ScreenRow } from '../../../shared/component/ScreenElements/ScreenElements';
import { missionStatusLabels } from '../mission.constants';
import { styles as ui } from '../../../shared/component/ScreenElements/ScreenElements.styles';

function displayDate(value:string) {
    return new Date(value).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
}

export function MissionScreen() {
    const { status } = useLocalSearchParams<{status?: string}>();
    const initialStatus = status === 'EN_COURS' ? 'EN_COURS' : 'DEFAULT';
    const { session, selected, setSelected, error, feedback } = useWorkspace();
    if (!session) return <Redirect href="/login" />;
    const progress = Math.min(100, Math.max(0, selected?.progress ?? 0));
    return (
        <MobileLayout active="missions">
            {selected ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
                <Pressable style={styles.inline} accessibilityRole="button" onPress={() => setSelected(null)}>
                    <RemixIcon name="arrow-left-s-line" size={21} />
                    <Text accessibilityRole="header" style={styles.title}>Détail de la mission</Text>
                </Pressable>
                {error ? <Text accessibilityRole="alert" style={ui.danger}>{error}</Text> : null}
                {feedback ? <Text accessibilityLiveRegion="polite" style={ui.body}>{feedback}</Text> : null}
                <View style={styles.card}>
                    <View style={styles.banner}>
                        <RemixIcon name="scan-2-line" color="#fff" size={30} />
                        <View style={styles.grow}>
                            {selected.reference ? <Text style={styles.bannerLabel}>{selected.reference}</Text> : null}
                            <Text style={styles.bannerTitle}>{selected.title}</Text>
                            {selected.entityName ? <Text style={styles.bannerLabel}>{selected.entityName}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.body}>
                        <ScreenRow title="Entité contrôlée" subtitle={selected.entityName || 'Non renseignée'} icon="government-line" />
                        {selected.startsOn && selected.endsOn ? <ScreenRow title="Période de la mission"
                            subtitle={displayDate(selected.startsOn)+' – '+displayDate(selected.endsOn)} icon="calendar-line" /> : null}
                        {selected.team?.length ? <ScreenRow title="Équipe" subtitle={selected.team.map(member=>member.name).join(', ')}
                            icon="group-line" /> : null}
                        <View style={styles.inline}>
                            <Text style={[styles.title,styles.grow]}>Avancement de la mission</Text><Text style={styles.progress}>{progress} %</Text>
                        </View>
                        <View accessibilityRole="progressbar" accessibilityValue={{min:0,max:100,now:progress}} style={styles.track}>
                            <View style={[styles.fill,{width:progress+'%' as `${number}%`}]} />
                        </View>
                    </View>
                </View>
                {selected.status === 'EN_COURS' && selected.workPermissions?.createFinding ? (
                    <Pressable accessibilityRole="button" style={styles.createFinding}
                        onPress={() => router.push({pathname:'/new-finding',params:{missionId:selected._id}})}>
                        <RemixIcon name="clipboard-line" color="#fff" size={23} />
                        <Text style={styles.createFindingLabel}>Créer un constat</Text>
                        <RemixIcon name="arrow-right-s-line" color="#fff" size={22} />
                    </Pressable>
                ) : null}
                <Text style={styles.title}>Actions rapides</Text>
                <View style={styles.actions}>
                    
                    <Pressable accessibilityRole="button" style={[styles.action,{backgroundColor:'#fff5df'}]} onPress={() => router.push({pathname:'/evidence',params:{missionId:selected._id}})}>
                        <RemixIcon name="image-line" color="#9f6200" size={24} /><Text style={styles.actionText}>Pièces justificatives</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" style={[styles.action,{backgroundColor:'#fff0f0'}]} onPress={() => router.push('/checklist')}>
                        <RemixIcon name="file-text-line" color="#ad2432" size={24} /><Text style={styles.actionText}>Programme de contrôle</Text>
                    </Pressable>
                </View>
                <Text style={styles.title}>Informations clés</Text>
                <ScreenRow title="Périmètre" subtitle={selected.scope} icon="flag-line" />
                <ScreenRow title="Statut" subtitle={missionStatusLabels[selected.status] ?? selected.status} icon="shield-check-line" />
                {selected.reportDueOn ? <ScreenRow title="Échéance du rapport" subtitle={displayDate(selected.reportDueOn)} icon="time-line" /> : null}
                <MissionHistory key={selected._id} mission={selected} />
                {selected.workPermissions?.readFindings ? <MissionFindings key={'findings-'+selected._id} missionId={selected._id} /> : null}
            </ScrollView> : <MissionList key={initialStatus} initialStatus={initialStatus} />}
        </MobileLayout>
    );
}

const styles = StyleSheet.create({
    inline:{flexDirection:'row',alignItems:'center',gap:8},
    grow:{flex:1},
    title:{color:'#122452',fontSize:15,fontWeight:'800'},
    card:{overflow:'hidden',borderRadius:14,backgroundColor:'#f8fbff',borderWidth:1,borderColor:'#dce7f7',elevation:2},
    banner:{backgroundColor:'#075bb8',padding:13,flexDirection:'row',alignItems:'center',gap:11},
    bannerLabel:{color:'#e0edff',fontSize:12},
    bannerTitle:{color:'#fff',fontSize:16,fontWeight:'800'},
    body:{padding:10,gap:7},
    track:{height:6,backgroundColor:'#dce9fd',borderRadius:8,overflow:'hidden'},
    fill:{height:6,backgroundColor:'#086ada',borderRadius:8},
    progress:{color:'#0959c7',fontSize:13,fontWeight:'800'},
    createFinding:{minHeight:49,borderRadius:13,backgroundColor:'#0959c7',paddingHorizontal:13,flexDirection:'row',alignItems:'center',gap:9,elevation:2},
    createFindingLabel:{flex:1,color:'#fff',fontWeight:'800',fontSize:15},
    actions:{flexDirection:'row',gap:8},
    action:{flex:1,minHeight:76,alignItems:'center',justifyContent:'center',gap:4,borderRadius:12,padding:6,elevation:2},
    actionText:{fontSize:12,fontWeight:'700',color:'#132450',textAlign:'center'},
});
