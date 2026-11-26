import { dryMain } from '../../../dry-core/dry-service/dry-main.service';
import type { DryQueryResultsInterface } from '../../../dry-core/dry-model/dry-interface';

export interface RegistryRecord {
    _id:string; title:string; missionTitle?:string; description:string; isRead:boolean; createdAt?:string;
}

export function getPage(page:number,q:string,filter:string) {
    return dryMain.getAll<DryQueryResultsInterface<RegistryRecord>>({page,pageSize:20,q,unread:filter},'/notifications');
}

export const notificationService = {
    unread: () => dryMain.getOne<{data:{unread:number}}>('/notifications/unread'),
    markRead: (id:string) => dryMain.update<{data:{isRead:boolean}}>({},'/notifications/'+encodeURIComponent(id)+'/read'),
    register: (token:string) => dryMain.create({token},'/notifications/device'),
    unregister: (token:string) => dryMain.create({token},'/notifications/device/remove'),
};
