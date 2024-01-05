import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { PlaceHolderDirective } from "../shared/placeholder.directive";
import { AlertComponent } from '../shared/alert/alert.component'
import { Role } from '../shared/roles.enum';
import { AuthResponseData, AuthService } from "./auth.service";
import { FormulaService } from "../shared/formula.service";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
    private isLogInMode:boolean = true;
    public isLoading:boolean = false;
    private error: string = null;
    @ViewChild(PlaceHolderDirective, { static: true }) alertHost: PlaceHolderDirective;

    private closeSub: Subscription;

    constructor (private route: ActivatedRoute, private authService: AuthService, private router: Router, private componentFactoryResolver: ComponentFactoryResolver, private formulaService: FormulaService) {}

    ngOnInit() {
        this.route.queryParams.subscribe(
            (queryParams: Params) => {
              const logout = queryParams['logout'] === 'true' ? true : false;
              if (logout) {
                this.authService.logout();
              } 
            }
        );
    }

    onSwitchMode() {
        this.isLogInMode = !this.isLogInMode;
    }

    onSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }
        const email = form.value.email;
        const password = form.value.password;

        let authObs: Observable<AuthResponseData>;

        this.isLoading = true;
        if (this.isLogInMode) {
            authObs = this.authService.login(email, password);
        } 
        // else {
        //     authObs = this.authService.signup(email, password);
        // }
        authObs.subscribe(resData => {
            this.formulaService.setFormulas();
            this.isLoading = false;
            const rolesUser = resData.rolename.split(',');
			const rolesJobOrder = [Role.joborder,Role.jobordereditor,Role.joborderadmin,Role.admin];
			const rolesInvoice = [Role.invoice,Role.invoiceeditor,Role.invoiceadmin];
			const rolesReceipt = [Role.receipt,Role.receipteditor,Role.receiptadmin];
			const rolesReport = [Role.report];
			const rolesInquiry = [Role.inquiry];
            if (rolesJobOrder.filter(x => rolesUser.includes(x)).length > 0) {
                this.router.navigate(['/job-orders']);
            } else if (rolesInvoice.filter(x => rolesUser.includes(x)).length > 0) {
                this.router.navigate(['/invoices']);
            } else if (rolesReceipt.filter(x => rolesUser.includes(x)).length > 0) {
                this.router.navigate(['/receipts']);
            } else if (rolesReport.filter(x => rolesUser.includes(x)).length > 0) {
                this.router.navigate(['/reports']);
            } else if (rolesInquiry.filter(x => rolesUser.includes(x)).length > 0) {
                this.router.navigate(['/inquiry']);
            }
        }, errorMessage => {
            this.error = errorMessage;
            this.showErrorAlert(errorMessage);
            this.isLoading = false;
        });

        
        form.reset();
    }

    onHandleError() {
        this.error = null;
    }

    private showErrorAlert(message: string) {
        const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
        const hostViewContainerRef = this.alertHost.viewContainerRef;
        hostViewContainerRef.clear();
        const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);
        componentRef.instance.message = message;
        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            hostViewContainerRef.clear();
        });
    }

    ngOnDestroy() {
        if (this.closeSub) { this.closeSub.unsubscribe(); }
    }
}