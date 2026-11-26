import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { getAuthSession } from '../../../dry-module/dry-auth/context/auth-session';
import { notificationService } from '../service/Notifications.service';

const Inbox = createContext({
    unread:0, revision:0, refresh:(_force?:boolean)=>Promise.resolve(), releaseDevice:()=>{},
});

export function NotificationInbox({children}:PropsWithChildren) {
    const {session,liveRevision} = useWorkspace();
    const [unread,setUnread] = useState(0);
    const [revision,setRevision] = useState(0);
    const lastUnread = useRef(0);
    const device = useRef<string | null>(null);
    const query = useRef(0);

    const refresh = useCallback(async (force=false) => {
        if (!session) return;
        const request = ++query.current;
        try {
            const {data} = await notificationService.unread();
            if (request !== query.current) return;
            if (force || lastUnread.current !== data.unread) setRevision(value=>value+1);
            lastUnread.current = data.unread;
            setUnread(data.unread);
        } catch {
            // Un réseau brièvement indisponible ne remet pas le compteur à zéro.
        }
    },[session]);

    useEffect(() => {
        if (liveRevision) void refresh(true);
    },[liveRevision,refresh]);

    const releaseDevice = useCallback(() => {
        if (device.current) void notificationService.unregister(device.current).catch(()=>{});
        device.current = null;
    },[]);

    useEffect(() => {
        if (!session) {
            query.current++;
            lastUnread.current = 0;
            setUnread(0);
            return;
        }
        void refresh();
        const timer = setInterval(()=>{ if (AppState.currentState === 'active') void refresh(); },12000);
        const resume = AppState.addEventListener('change',state=>{ if(state==='active') void refresh(true); });
        return () => { clearInterval(timer);resume.remove();query.current++; };
    },[session,refresh]);

    useEffect(() => {
        // Expo Go garde l'actualisation de la boîte et ne charge pas le module de push distant.
        if (!session || Platform.OS === 'web' || Constants.appOwnership === 'expo') return;
        const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
        if (typeof projectId !== 'string' || !projectId) return;
        const version = getAuthSession().version;
        const signedIn = () => getAuthSession().version === version;
        let cancelled = false;
        const subscriptions: {remove:()=>void}[] = [];

        async function register() {
            const Notifications = await import('expo-notifications');
            if (cancelled) return;
            Notifications.setNotificationHandler({handleNotification:async()=>({
                shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false,
            })});
            subscriptions.push(Notifications.addNotificationReceivedListener(()=>void refresh(true)));
            const open = (response: Awaited<ReturnType<typeof Notifications.getLastNotificationResponseAsync>>) => {
                if (!cancelled && signedIn() && response?.notification.request.content.data?.screen === 'notifications') {
                    void Notifications.clearLastNotificationResponseAsync();
                    void refresh(true);
                    router.navigate('/notifications');
                }
            };
            subscriptions.push(Notifications.addNotificationResponseReceivedListener(open));
            open(await Notifications.getLastNotificationResponseAsync());
            if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('missions',{
                name:'Missions IGF',importance:Notifications.AndroidImportance.HIGH,
            });
            const permission = await Notifications.getPermissionsAsync();
            const granted = permission.granted || (permission.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
            if (!granted || cancelled || !signedIn()) return;
            const {data:token} = await Notifications.getExpoPushTokenAsync({projectId});
            if (cancelled || !signedIn()) return;
            device.current = token;
            await notificationService.register(token);
            subscriptions.push(Notifications.addPushTokenListener(async () => {
                try {
                    const {data:renewed} = await Notifications.getExpoPushTokenAsync({projectId});
                    if (cancelled || !signedIn()) return;
                    if (device.current && renewed !== device.current) await notificationService.unregister(device.current);
                    device.current = renewed;
                    await notificationService.register(renewed);
                } catch {}
            }));
        }
        void register().catch(()=>{});
        return () => {cancelled=true;for(const subscription of subscriptions) subscription.remove();};
    },[session,refresh]);

    return <Inbox.Provider value={{unread,revision,refresh,releaseDevice}}>{children}</Inbox.Provider>;
}

export const useNotificationInbox = () => useContext(Inbox);
