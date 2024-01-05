import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../auth/user.model';
import { Role } from '../shared/roles.enum';
import { environment } from  "../../environments/environment";
import { ChangePasswordComponent } from '../shared/change-password/change-password.component';
import { PlaceHolderDirective } from '../shared/placeholder.directive';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  public  isAuthenticated:boolean = false;
  private currentUser: string = null;
  private userSub: Subscription;
  public user: User;
  public roles: typeof Role = Role;
  @ViewChild(PlaceHolderDirective, { static: true }) changePasswordHost: PlaceHolderDirective;
  private closeSub: Subscription;

  constructor(private authService: AuthService, private router: Router, private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!this.user;
      if (this.isAuthenticated) {
        this.currentUser = user.first_name;
      } else {
        this.currentUser = null;
      }
    });
  }

  onGetVersion() {
    return environment.version; 
  }

  onGetCurrentUser() {
    return this.currentUser;
  }

  onChangePassword() {
    this.showChangePassword();
  }

  onLogout() {
    // this.authService.logout();
    this.router.navigate(['/auth'], { queryParams: { logout: 'true' }});
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
  }

	private showChangePassword() {
		const hostComponentFactory = this.componentFactoryResolver.resolveComponentFactory(ChangePasswordComponent);
		const hostViewContainerRef = this.changePasswordHost.viewContainerRef;
		hostViewContainerRef.clear();
		const hostComponent = hostViewContainerRef.createComponent(hostComponentFactory);
		this.closeSub = hostComponent.instance.close.subscribe(() => {
			this.closeSub.unsubscribe();
      // hostComponent.destroy();
			hostViewContainerRef.clear();
		});
	}
}
