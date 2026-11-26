import type { DryQueryResultsInterface } from './dry-query-results.interface';

export interface Mission {
    _id: string;
    title: string;
    progress?:number;
    createdAt?:string;
    entityName?:string;
    reference?:string;
    scope?: string;
    startsOn?: string;
    endsOn?: string;
    reportDueOn?: string;
    team?: {name:string; role?:string}[];
    status: string;
    version: number;
    workPermissions?: {
        readTimeline?:boolean; readProgram?:boolean; writeProgram?:boolean; readFindings?:boolean;
        readReport?:boolean; readContradictions?:boolean; readRecommendations?:boolean; createFinding?:boolean;
    };
}

export interface Finding { _id:string; title:string; description:string; severity:string; status:string; category?:string; location?:string; notes?:string }

export type Page = DryQueryResultsInterface<Mission>;
