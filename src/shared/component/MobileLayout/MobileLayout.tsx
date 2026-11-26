import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemixIcon } from '../RemixIcon';
import type { IconName } from '../RemixIcon';
import { useNotificationInbox } from '../../../feature/notification/screen/NotificationInbox';
import { ProfileDrawer } from './ProfileDrawer';
import { styles } from './MobileLayout.styles';

const tabs = [
    {id:'home',label:'Accueil',icon:'home-4-line',href:'/'},
    {id:'missions',label:'Missions',icon:'file-list-3-line',href:'/missions'},
    {id:'nouveau',label:'Nouveau constat',icon:'add-line',href:'/findings'},
    {id:'findings',label:'Constats',icon:'clipboard-line',href:'/findings'},
    {id:'profile',label:'Profil',icon:'user-3-line',href:'/profile'},
] as const satisfies readonly {id:string;label:string;icon:IconName;href:Href}[];

export function MobileLayout({children,active,showTabs=true,title,back=false,hideBar=false,landing=false}:PropsWithChildren<{active:string;showTabs?:boolean;title?:string;back?:boolean;hideBar?:boolean;landing?:boolean}>) {
    const {unread} = useNotificationInbox();
    const [menu,setMenu] = useState(false);
    function go(href:Href) {
        setMenu(false);
        router.replace(href);
    }

    return (
        <SafeAreaView style={[styles.safe,landing && styles.landingSafe]}>
            <View style={[styles.shell,landing && styles.landingShell]}>
                <View style={[styles.header,landing && styles.landingHeader]}>
                    {back ? <Pressable accessibilityRole="button" accessibilityLabel="Retour" style={styles.headerAction}
                        onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}>
                        <RemixIcon name="arrow-left-s-line" />
                    </Pressable> : showTabs ? <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir le menu du compte" accessibilityState={{expanded:menu}}
                        style={styles.headerAction} onPress={() => setMenu(!menu)}><RemixIcon name="menu-line" size={landing ? 29 : 22} /></Pressable> : <View style={styles.headerAction} />}
                    <View style={styles.brand}>
                        {title || showTabs ? <Text accessibilityRole="header" style={styles.name}>{title || 'IGF Inspect'}</Text> : (
                            <Image source={require('../../../../assets/igf-logo.png')} style={styles.logo}
                                resizeMode="contain" accessibilityLabel="Inspection générale des finances" />
                        )}
                        <View style={[styles.flag,landing && styles.landingFlag]} accessible={false}><View style={styles.cyan}/><View style={styles.yellow}/><View style={styles.red}/></View>
                    </View>
                    {showTabs ? <Pressable accessibilityRole="button" accessibilityLabel={unread ? 'Notifications, non lues : '+unread : 'Notifications'} style={styles.headerAction} onPress={() => go('/notifications')}>
                        <RemixIcon name="notification-3-line" size={landing ? 29 : 22} />
                        {unread > 0 ? <View style={styles.dot} /> : null}
                    </Pressable> : <View style={styles.headerAction} />}
                </View>
                {menu ? <ProfileDrawer unread={unread} close={()=>setMenu(false)} openLink={href=>{
                    setMenu(false);
                    router.navigate(href);
                }} /> : null}
                <View style={styles.body}>{children}</View>
                {showTabs && !hideBar ? <View style={styles.tabs}>
                    {tabs.map(tab => {
                        const selected = active === tab.id;
                        const add = String(tab.id) === 'nouveau';
                        return <Pressable key={tab.id} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{selected}}
                            style={styles.tab} onPress={() => { if (!selected) go(tab.href); }}>
                            <View style={add && styles.add}>
                                <RemixIcon name={selected && tab.id === 'home' ? 'home-4-fill' : tab.icon} size={add ? 27 : 21}
                                    color={add ? '#fff' : selected ? '#0847aa' : '#24375d'} />
                            </View>
                            {add ? null : <Text style={[styles.tabLabel,selected && styles.tabSelected]}>{tab.label}</Text>}
                        </Pressable>;
                    })}
                </View> : null}
            </View>
        </SafeAreaView>
    );
}
