import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { environment } from  "../../environments/environment";

export interface TranResponseData {
    Success: boolean;
    Error?: string;
}

@Injectable()
export class ApiService{

    constructor(private http: HttpClient, private authService: AuthService) {}

    async getApi(route: string, endpoint: string, query: string=null) {
        return await this.http.get('http://'+environment.apihost+':'+environment.apiport.toString()+'/'+route+'/'+endpoint+(!!query ? query : '')).pipe(catchError(this.handledError)).toPromise().catch(errorMessage => {
            console.log(errorMessage);
        });
    }

    async postJobOrder(jobOrder: {}) {
        return <TranResponseData> await this.http.post<TranResponseData>('http://'+environment.apihost+':'+environment.apiport.toString()+'/joborder/transaction', jobOrder).pipe(catchError(this.handledError)).toPromise().catch(errorMessage => {
            console.log(errorMessage);
        });
    }

    async postInvoice(invoice: {}) {
        return <TranResponseData> await this.http.post<TranResponseData>('http://'+environment.apihost+':'+environment.apiport.toString()+'/invoice/transaction', invoice).pipe(catchError(this.handledError)).toPromise().catch(errorMessage => {
            console.log(errorMessage);
        });
    }

    async postReceipt(receipt: {}) {
        return <TranResponseData> await this.http.post<TranResponseData>('http://'+environment.apihost+':'+environment.apiport.toString()+'/receipt/transaction', receipt).pipe(catchError(this.handledError)).toPromise().catch(errorMessage => {
            console.log(errorMessage);
        });
    }

    async postChangePassword(oldpassword: string, newpassword: string) {
        return <TranResponseData> await this.http.post<TranResponseData>('http://'+environment.apihost+':'+environment.apiport.toString()+'/auth/changepassword', {oldpassword: oldpassword, newpassword: newpassword}).pipe(catchError(this.handledError)).toPromise().catch(errorMessage => {
            console.log(errorMessage);
        });
    }

    async postInquiry(joborderno: string, invoiceno: string, orno: string) {
        return await this.http.post('http://'+environment.apihost+':'+environment.apiport.toString()+'/inquiry/master', {joborderno: joborderno, invoiceno: invoiceno, orno: orno}).pipe(catchError(this.handledError)).toPromise().catch(errorMessage => {
            console.log(errorMessage);
        });
    }

    private handledError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured!'
        if (!!errorRes.error || !!errorRes.error.detail) {
            errorMessage = errorRes.error.detail;
        }
        return throwError(errorMessage);
    }
}