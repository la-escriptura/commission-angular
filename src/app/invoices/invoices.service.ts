import { Injectable } from "@angular/core";
import { Invoice } from "./invoice.model";
import { ApiService } from "../shared/api.service";
import { Role } from "../shared/roles.enum";

@Injectable()
export class InvoicesService {
    public rolesInvoice: Role[] = [Role.invoiceeditor,Role.invoiceadmin,Role.admin];

    constructor(private apiService: ApiService) {}

    async getJobOrders() {
        return <Array<any>>await this.apiService.getApi('invoice', 'joborders');
    }

    async getRedoInvoices() {
        return <Array<any>>await this.apiService.getApi('invoice', 'redoinvoices');
    }

    async addInvoice(invoice: Invoice) {
        return await this.apiService.postInvoice(invoice.values);
    }
}