import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import moment from 'moment';

@Injectable()
export class UtilityService{

    constructor(private apiService: ApiService) {}

    async getServerTimestamp() {
        return <string>await this.apiService.getApi('utility', 'servertimestamp');
    }

    isDateValid(dateString: string, dateFormat: string): boolean {
        return moment(dateString, dateFormat, true).isValid();
    }
}
