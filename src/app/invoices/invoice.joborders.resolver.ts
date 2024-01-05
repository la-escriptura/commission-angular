import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { InvoicesService } from "./invoices.service";

@Injectable()
export class InvoiceJobordersResolver implements Resolve<Array<any>> {

    constructor(private invoicesService: InvoicesService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Array<any>> {
        return this.invoicesService.getJobOrders();
    }
}