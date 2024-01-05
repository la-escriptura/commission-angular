import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, Subscription, throwError } from "rxjs";
import jwt_decode from 'jwt-decode';
import { User } from "./user.model";
import { Role } from "../shared/roles.enum";
import { environment } from  "../../environments/environment";

export interface AuthResponseData {
    first_name: string;
    rolename: any;
    access_token: string;
    refresh_token: string;
    token_expires: string;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    public user = new BehaviorSubject<User>(null);
    private timeoutRefresh: any;
    private intervalRefresh: any;
    private intervalTolerance: number = 5000;

    constructor(private http: HttpClient, private router: Router) {}

    login (email: string, password: string) {
        return this.http.post<AuthResponseData>('http://'+environment.apihost+':'+environment.apiport.toString()+'/auth/login', {
            email: email,
            password: password
        }).pipe(catchError(this.handledError)
        , tap(resData => {
            this.handleAuthentication(resData.access_token, resData.refresh_token, +resData.token_expires, resData.first_name, resData.rolename.split(','))
            this.autoRefresh(+resData.token_expires * 1000);
        }));
    }

    autoLogin(serverTimestamp: string): boolean {
        const userData: {
            access_token: string;
            refresh_token: string;
            token_expires: string;
            userid: string
            first_name: string;
            rolename: Role[];
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }
        
        const exp: number = +jwt_decode(userData.access_token)["exp"] * 1000
        if (exp < (new Date(serverTimestamp).getTime() - this.intervalTolerance)) {
            return false;
        }

        const loadedUser = new User(userData.access_token, userData.refresh_token, +userData.token_expires, userData.first_name, userData.rolename);
        if (loadedUser.access_token) {
            this.user.next(loadedUser);
            this.autoRefresh(+userData.token_expires * 1000);
        }

        const initRefresh = new Date(exp).getTime() - new Date(serverTimestamp).getTime() - this.intervalTolerance;
        this.timeoutRefresh = setTimeout(() => {
            this.refresh();
        }, (initRefresh < this.intervalTolerance ? 0 : initRefresh));
        return true;
    }

    refresh () {
        this.http.post<{access_token: string, refresh_token: string, token_expires: string}>('http://'+environment.apihost+':'+environment.apiport.toString()+'/auth/refresh', null).pipe(catchError(this.handledError)).subscribe(resData => {
            this.handleAuthentication(resData.access_token, resData.refresh_token, +resData.token_expires)
        }, errorMessage => {
            console.log(errorMessage);
        });

        if (this.timeoutRefresh) {
            clearTimeout(this.timeoutRefresh);
        }
        this.timeoutRefresh = null;
    }

    autoRefresh(token_expires: number) {
        this.intervalRefresh = setInterval(() => {
            this.refresh();
            // this.logout();
            // this.router.navigate(['/auth']);
        }, token_expires - this.intervalTolerance);
    }

    logout() {
        this.user.next(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('rowLimitInvoice');
        if (this.intervalRefresh) {
            clearInterval(this.intervalRefresh);
        }
        this.intervalRefresh = null;
    }

    private handleAuthentication(access_token: string, refresh_token: string, token_expires: number, first_name?: string, rolename?: Role[]) {
        let user: User;
        if (!!first_name) {
            user = new User(access_token, refresh_token, token_expires, first_name, rolename);
        } else {
            user = this.user.value;
            user.access_token = access_token;
            user.refresh_token = refresh_token;
            user.token_expires = token_expires;
        }
        this.user.next(user); 
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handledError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured!'
        if (!!errorRes.error || !!errorRes.error.detail) {
            errorMessage = errorRes.error.detail;
        }
        return throwError(errorMessage);
    }

    test() {
        this.http.post('http://'+environment.apihost+':'+environment.apiport.toString()+'/auth/refresh',null).pipe(catchError(this.handledError)).subscribe(resData => {
            console.log(resData);
        }, errorMessage => {
            console.log(errorMessage);
        });
    }
}
