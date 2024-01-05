import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { ReceiptsService } from './receipts.service';

@Injectable()
export class ReceiptInvoicesResolver implements Resolve<Array<any>> {

    constructor(private receiptsService: ReceiptsService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        return this.receiptsService.getInvoices();
    }
}