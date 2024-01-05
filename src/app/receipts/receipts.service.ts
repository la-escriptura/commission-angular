import { Injectable } from "@angular/core";
import { Receipt } from "./receipt.model";
import { ApiService } from "../shared/api.service";
import { Role } from "../shared/roles.enum";

@Injectable()
export class ReceiptsService {
    public rolesReceipt: Role[] = [Role.receipteditor,Role.receiptadmin,Role.admin];
    
    constructor(private apiService: ApiService) {}

    async getInvoices() {
        return <Array<any>>await this.apiService.getApi('receipt', 'invoices');
    }

    async getRedoReceipts() {
        return <Array<any>>await this.apiService.getApi('receipt', 'redoreceipts');
    }

    async addReceipt(receipt: Receipt) {
        return await this.apiService.postReceipt(receipt.values);
    }
}