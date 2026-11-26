import { dryMain } from '../../../dry-core/dry-service/dry-main.service';
import type { DryQueryResultInterface } from '../../../dry-core/dry-model/dry-interface';

export interface AuditProgram { objectives:string[];procedures:string[];version:number }

const programPath = (id:string) => '/missions/'+encodeURIComponent(id)+'/program';

export function getProgram(id:string) {
    return dryMain.getOne<DryQueryResultInterface<AuditProgram|null>>(programPath(id));
}

// La version lue empêche un inspecteur d’écraser le travail enregistré par un autre.
export function saveProgram(id:string, program:Omit<AuditProgram,'version'>, expectedVersion:number) {
    return dryMain.replace<DryQueryResultInterface<AuditProgram>>({...program,expectedVersion},programPath(id));
}
