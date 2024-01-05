import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, take } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.authService.user.pipe(take(1), map(user => {
            // return !!user;
            const isAuth =  !!user;
            if (isAuth) {
                const rolesUser = user.rolename as Array<string>;
                const rolesRoute = route.data['roles'] as Array<string>;
                const intersection = rolesRoute.filter(x => rolesUser.includes(x));
                if (intersection.length > 0) {
                    return true;
                }
            } 
            return this.router.createUrlTree(['/auth']);
        }));
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.canActivate(childRoute, state);
    }
}