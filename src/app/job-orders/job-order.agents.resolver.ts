import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { JobOrdersService } from "./job-orders.service";

@Injectable()
export class JobOrderAgentsResolver implements Resolve<Array<any>> {

    constructor(private jobOrdersService: JobOrdersService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        return this.jobOrdersService.getAgents();
    }
}