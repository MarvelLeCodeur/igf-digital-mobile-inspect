import type { DryQueryResultInterface, DryQueryResultsInterface } from '../../../dry-core/dry-model/dry-interface';
import { dryMain } from '../../../dry-core/dry-service/dry-main.service';
import type { Finding, Mission, Page } from '../../../dry-core/dry-model/dry-interface/mission.interface';
import type { Severity } from '../mission.constants';

const missionPath = (id: string) => '/missions/' + encodeURIComponent(id);

export interface MissionEvent { _id:string; action:string; category:string; timestamp:string; reason?:string; previousStatus?:string; nextStatus?:string }

export const missionService = {
    timeline(id:string,page:number,category:string) {
        return dryMain.getAll<DryQueryResultsInterface<MissionEvent>>({page,pageSize:10,category},missionPath(id)+'/timeline');
    },
    list(page: number) {
        return dryMain.getAll<Page>({page,pageSize:20}, '/missions');
    },
    search(page:number,q:string,status:string) {
        return dryMain.getAll<Page>({page,pageSize:20,q,status},'/missions');
    },
    forFinding(page:number,q?:string) {
        return dryMain.getAll<Page>({page,pageSize:20,forFinding:'true',q},'/missions');
    },
    summary() {
        return dryMain.getOne<{data: Record<string, number>}>('/missions/summary');
    },
    detail(id: string) {
        return dryMain.getById<DryQueryResultInterface<Mission>>(id, '/missions');
    },
    findings(id:string,page:number,q:string,status:string,severity?:string) {
        return dryMain.getAll<DryQueryResultsInterface<Finding>>({page,pageSize:10,q,status,severity},missionPath(id)+'/findings');
    },
    findingOperationId(id: string) {
        return dryMain.create<{ data: { id: string } }>({}, missionPath(id) + '/findings/operation-id');
    },
    createFinding(id: string, payload: { title: string; description: string; severity: Severity;category?:string;location?:string;notes?:string;submit?:boolean }, key: string) {
        return dryMain.create<DryQueryResultInterface<Finding>>(payload, missionPath(id) + '/findings', key);
    },
};
