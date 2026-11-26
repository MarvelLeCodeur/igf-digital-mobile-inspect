import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { accountService } from '../../../dry-module/dry-account/service/account.service';
import type { UserProfile } from '../../../dry-module/dry-user/model/dry-user.interface';
import { RemixIcon } from '../RemixIcon';
import type { IconName } from '../RemixIcon';

const links = [
    {label:'Mon profil', icon:'user-3-line', href:'/profile'},
    {label:'Sécurité et paramètres', icon:'shield-check-line', href:'/settings'},
    {label:'Notifications', icon:'notification-3-line', href:'/notifications'},
] as const satisfies readonly {label:string;icon:IconName;href:Href}[];

export function ProfileDrawer({close,openLink,unread}:{
    close:()=>void; openLink:(href:Href)=>void; unread:number;
}) {
    const {width} = useWindowDimensions();
    const panelWidth = Math.min(340,Math.round(width*.86));
    const animation = useRef(new Animated.Value(0)).current;
    const {session,profile} = useWorkspace();
    const [identity,setIdentity] = useState<UserProfile|null>(null);
    const [failedPhoto,setFailedPhoto] = useState<string|null>(null);
    const person = profile ?? identity;
    const initials = person?.displayName.trim().split(/\s+/).slice(0,2).map(word=>word[0]?.toUpperCase()).join('') || 'IGF';

    useEffect(() => {
        if (!session || profile) return;
        let active = true;
        // Le volet lit la fiche sans lancer le chargement de l'écran courant.
        void accountService.getProfile().then(({data})=>{ if(active) setIdentity(data); },()=>{});
        return () => { active=false; };
    },[session,profile]);

    useEffect(() => {
        let mounted = true;
        void AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{
            if (!mounted) return;
            if (reduced) animation.setValue(1);
            else Animated.timing(animation,{toValue:1,duration:230,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();
        },()=>{if(mounted) animation.setValue(1);});
        return () => { mounted=false;animation.stopAnimation(); };
    },[animation]);

    return (
        <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop,{opacity:animation}]}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Fermer le volet" style={styles.fill} onPress={close} />
                </Animated.View>
                <Animated.View style={[styles.panel,{width:panelWidth,transform:[{translateX:animation.interpolate({inputRange:[0,1],outputRange:[-panelWidth,0]})}]}]}>
                    <SafeAreaView edges={['top','left','bottom']} style={styles.safe} accessibilityViewIsModal>
                        <View style={styles.heading}>
                            <Text accessibilityRole="header" style={styles.title}>Mon espace</Text>
                            <Pressable accessibilityRole="button" accessibilityLabel="Fermer le menu du compte" style={styles.close} onPress={close}>
                                <RemixIcon name="close-line" size={24} color="#254575" />
                            </Pressable>
                        </View>
                        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                            <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir mon profil" onPress={()=>openLink('/profile')} style={styles.card}>
                                <View style={styles.identity}>
                                    {person?.avatar && person.avatar !== failedPhoto ? (
                                        <Image source={{uri:person.avatar}} style={styles.avatar} onError={()=>setFailedPhoto(person.avatar ?? null)} />
                                    ) : <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View>}
                                    <View style={styles.identityText}>
                                        <Text style={styles.name}>{person?.displayName || 'Mon profil'}</Text>
                                        {person?.jobTitle ? <Text style={styles.job}>{person.jobTitle}</Text> : null}
                                    </View>
                                    <RemixIcon name="arrow-right-s-line" size={21} color="#275a9b" />
                                </View>
                                <View style={styles.flag} accessible={false}>
                                    <View style={[styles.stripe,styles.cyan]} /><View style={[styles.stripe,styles.yellow]} /><View style={[styles.stripe,styles.red]} />
                                </View>
                            </Pressable>
                            <View style={styles.links}>
                                {links.map((link,index)=>(
                                    <Pressable key={link.href} accessibilityRole="button" onPress={()=>openLink(link.href)}
                                        style={({pressed})=>[styles.row,index > 0 && styles.divider,pressed && styles.pressed]}>
                                        <View style={styles.icon}><RemixIcon name={link.icon} size={20} color="#075bbc" /></View>
                                        <Text style={styles.label}>{link.label}</Text>
                                        {link.href === '/notifications' && unread > 0 ? (
                                            <Text accessibilityLabel={unread+' notifications non lues'} style={styles.badge}>{unread}</Text>
                                        ) : null}
                                        <RemixIcon name="arrow-right-s-line" size={19} color="#587394" />
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay:{flex:1},
    fill:{flex:1},
    backdrop:{position:'absolute',inset:0,backgroundColor:'#10244d70'},
    panel:{height:'100%',backgroundColor:'#f5f8fd',borderTopRightRadius:25,borderBottomRightRadius:25,elevation:16,
        shadowColor:'#081939',shadowOffset:{width:5,height:0},shadowOpacity:.26,shadowRadius:17},
    safe:{flex:1},
    heading:{minHeight:65,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,paddingHorizontal:17},
    title:{fontSize:22,fontWeight:'800',color:'#132a55',letterSpacing:-.4},
    close:{width:44,height:44,borderRadius:13,backgroundColor:'#eaf1fc',alignItems:'center',justifyContent:'center'},
    content:{padding:15,paddingTop:3,gap:14},
    card:{borderRadius:17,overflow:'hidden',backgroundColor:'#e1eeff',backgroundImage:'linear-gradient(135deg, #edf6ff 0%, #d7eaff 100%)',
        borderColor:'#d3e5fa',borderWidth:1},
    identity:{minHeight:81,padding:11,flexDirection:'row',alignItems:'center',gap:9},
    avatar:{width:50,height:50,borderRadius:15,backgroundColor:'#cbe2ff',borderWidth:2,borderColor:'#fff',alignItems:'center',justifyContent:'center'},
    initials:{fontSize:17,fontWeight:'800',color:'#084d9e'},
    identityText:{flex:1,gap:3},
    name:{fontSize:15,fontWeight:'800',color:'#132a55'},
    job:{fontSize:12,lineHeight:16,color:'#355781'},
    flag:{height:3,width:78,marginLeft:13,marginBottom:10,flexDirection:'row',overflow:'hidden',borderRadius:2},
    stripe:{flex:1},
    cyan:{backgroundColor:'#087bfa'},yellow:{backgroundColor:'#ffd600'},red:{backgroundColor:'#e62030'},
    links:{backgroundColor:'#fff',borderRadius:16,borderColor:'#e1eaf7',borderWidth:1,overflow:'hidden'},
    row:{minHeight:53,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:10,paddingVertical:7},
    divider:{borderTopWidth:1,borderTopColor:'#edf2fa'},
    icon:{width:35,height:35,borderRadius:10,backgroundColor:'#eaf3ff',alignItems:'center',justifyContent:'center'},
    label:{flex:1,color:'#18345e',fontWeight:'700',fontSize:13},
    badge:{minWidth:22,textAlign:'center',borderRadius:7,overflow:'hidden',paddingHorizontal:4,paddingVertical:2,color:'#aa2637',backgroundColor:'#fdeef1',fontSize:11,fontWeight:'800'},
    pressed:{backgroundColor:'#eef5ff'},
});
