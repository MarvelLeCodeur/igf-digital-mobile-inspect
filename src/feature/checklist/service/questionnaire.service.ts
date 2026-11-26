import { dryMain } from '../../../dry-core/dry-service/dry-main.service';

export interface Answer { questionId:string; response:string; comment?:string }
export interface Sample { reference:string; outcome:string; evidenceReference?:string; comment?:string }
export interface ControlRecord {
    version:number; status:string; answers:Answer[]; samples:Sample[];
    totals:{tested:number;withGap:number}; review?:{reason:string};
}
export interface Template { id:string; version:number; title:string; questions:{id:string;label:string;required:boolean}[] }
export interface Questionnaire {
    template:Template;
    library:Template[];
    data:ControlRecord|null;
    editable:boolean;
}

const path = (id:string) => '/missions/'+encodeURIComponent(id)+'/questionnaire-rehearsal';

export function readQuestionnaire(id:string) {
    return dryMain.getOne<Questionnaire>(path(id));
}

export function writeQuestionnaire(id:string,templateId:string,templateVersion:number,expectedVersion:number,answers:Answer[],samples:Sample[],submit:boolean) {
    // La version envoyée est celle de la fiche chargée sur l’appareil.
    return dryMain.replace<{data:ControlRecord}>({templateId,templateVersion,expectedVersion,answers,samples,submit},path(id));
}
