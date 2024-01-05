import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { ReceiptsService } from "./receipts.service";

@Injectable()
export class ReceiptRedoReceiptsResolver implements Resolve<Array<any>> {
    constructor(private receiptService: ReceiptsService, private authService: AuthService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        let currentUser = null;
        let userSub = this.authService.user.subscribe(user => {
            currentUser = user;
        });
        userSub.unsubscribe();
        return ((!!currentUser && currentUser.rolename.some(role => this.receiptService.rolesReceipt.includes(role))) ? this.receiptService.getRedoReceipts() : Promise.resolve([]));
    }
}