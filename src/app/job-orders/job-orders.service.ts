import { Injectable } from "@angular/core";
import { ApiService } from "../shared/api.service";
import { JobOrder } from "./job-order.model";
import { Role } from "../shared/roles.enum";

@Injectable()
export class JobOrdersService {
    public rolesInvoice: Role[] = [Role.jobordereditor,Role.joborderadmin,Role.admin];

    constructor(private apiService: ApiService) {}

    async getAgents() {
        return <Array<any>>await this.apiService.getApi('joborder', 'agents');
    }

    async getCustomers() {
        return <Array<any>>await this.apiService.getApi('joborder', 'customers');
    }

    async getUnitMeasures() {
        return <Array<any>>await this.apiService.getApi('joborder', 'unitmeasures');
    }

    async getRedoJobOrders() {
        return <Array<any>>await this.apiService.getApi('joborder', 'redojoborders');
    }

    async addJobOrder(jobOrder: JobOrder) {
        return await this.apiService.postJobOrder(jobOrder.values);
    }
}