import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { formatDate } from '@angular/common';
import { ReportsService } from './reports.service';
import { UtilityService } from "../shared/utility.service";

@Injectable()
export class ReportSalesMonthResolver implements Resolve<Array<any>> {

    constructor(private receiptService: ReportsService, private util: UtilityService) {}

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        const serverTimestamp = await this.util.getServerTimestamp();
        const d = new Date(serverTimestamp);
        d.setMonth(d.getMonth() - 1);       
        return this.receiptService.getSalesMonth('?truncmonth='+formatDate(d, 'MMM 01, yyyy', 'en-US'));
    }
}