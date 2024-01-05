import { Injectable } from "@angular/core";
import { ApiService } from "../shared/api.service";

@Injectable()
export class ReportsService {

    constructor(private apiService: ApiService) {}

    async getSalesMonth(query: string) {
        return <Array<any>>await this.apiService.getApi('report', 'salesmonth',query);
    }

    async getSalesYear() {
        return <Array<any>>await this.apiService.getApi('report', 'salesyear');
    }

    async getSOA() {
        return <Array<any>>await this.apiService.getApi('report', 'soa');
    }

    async getCommCollect(query: string) {
        return <Array<any>>await this.apiService.getApi('report', 'commcollect',query);
    }

    async getCorpComm(query: string) {
        return <Array<any>>await this.apiService.getApi('report', 'corpcomm',query);
    }

    async getSalesRepComm(query: string) {
        return <Array<any>>await this.apiService.getApi('report', 'salesrepcomm',query);
    }
}