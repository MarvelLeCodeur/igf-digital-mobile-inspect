import type { DryQueryResultInterface } from '../../../dry-core/dry-model/dry-interface';
import { dryMain } from '../../../dry-core/dry-service/dry-main.service';

export interface HomeTotals {
    totals:{total:number;closed:number;recommendations:number;resolved:number;openRisks:number};
    statuses:Record<string,number>;
    permissions:{recommendations:boolean};
}

export function getHomeTotals() {
    return dryMain.getAll<DryQueryResultInterface<HomeTotals>>({entityPageSize:1},'/analytics');
}
