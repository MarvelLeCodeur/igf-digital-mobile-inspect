import { useEffect, useState } from 'react';
import { useRegistryScreen } from '../../../shared/hook/useRegistryScreen';
import { getPage, notificationService } from '../service/Notifications.service';
import type { RegistryRecord } from '../service/Notifications.service';
import { useNotificationInbox } from './NotificationInbox';

export function useNotificationsScreen() {
    const state = useRegistryScreen(getPage);
    const {refresh,revision} = useNotificationInbox();
    const [readError,setReadError] = useState('');
    const {load} = state;
    useEffect(() => {
        if (revision > 0) void load(1);
    },[revision,load]);

    async function open(item:RegistryRecord) {
        state.setSelected(item);
        setReadError('');
        if (item.isRead) return;
        try {
            await notificationService.markRead(item._id);
            state.setSelected(current=>current?._id===item._id?{...current,isRead:true}:current);
            await refresh(true);
        } catch {
            setReadError('Impossible de marquer cette notification comme lue.');
        }
    }

    return {...state,open,error:readError || state.error};
}
