import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { JobOrdersService } from "./job-orders.service";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class JobOrderRedoJobOrdersResolver implements Resolve<Array<any>> {
    constructor(private jobOrdersService: JobOrdersService, private authService: AuthService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        let currentUser = null;
        let userSub = this.authService.user.subscribe(user => {
            currentUser = user;
        });
        userSub.unsubscribe();
        return ((!!currentUser && currentUser.rolename.some(role => this.jobOrdersService.rolesInvoice.includes(role))) ? this.jobOrdersService.getRedoJobOrders() : Promise.resolve([]));
    }
}