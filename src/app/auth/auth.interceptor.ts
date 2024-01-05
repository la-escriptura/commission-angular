import { Injectable } from "@angular/core";
import { DefaultUrlSerializer } from "@angular/router";
import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { exhaustMap, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor (private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        let dus = new DefaultUrlSerializer();
        return this.authService.user.pipe(take(1), exhaustMap(user => {
            if (!user) {
                return next.handle(req);
            }
            if (req.url.endsWith("/auth/refresh")) {
                const modifiedReq = req.clone({headers: new HttpHeaders({
                    'Authorization': 'Bearer ' + user.refresh_token
                })});
                return next.handle(modifiedReq);
            } else if (req.url.endsWith("/utility/servertimestamp")) {
                return next.handle(req);
            }
            const modifiedReq = req.clone({headers: new HttpHeaders({
                'Authorization': 'Bearer ' + user.access_token
            })});
            return next.handle(modifiedReq);
        }));
    }
}