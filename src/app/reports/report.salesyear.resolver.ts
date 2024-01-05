import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { ReportsService } from './reports.service';

@Injectable()
export class ReportSalesYearResolver implements Resolve<Array<any>> {

    constructor(private reportsService: ReportsService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        return this.reportsService.getSalesYear();
    }
}