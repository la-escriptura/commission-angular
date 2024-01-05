import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { InvoicesService } from "./invoices.service";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class InvoiceRedoInvoicesResolver implements Resolve<Array<any>> {
    constructor(private invoicesService: InvoicesService, private authService: AuthService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        let currentUser = null;
        let userSub = this.authService.user.subscribe(user => {
            currentUser = user;
        });
        userSub.unsubscribe();
        return ((!!currentUser && currentUser.rolename.some(role => this.invoicesService.rolesInvoice.includes(role))) ? this.invoicesService.getRedoInvoices() : Promise.resolve([]));
    }
}