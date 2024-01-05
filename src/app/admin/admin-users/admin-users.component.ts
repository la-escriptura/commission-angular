import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { CanComponentDeactivate } from 'src/app/shared/can-deactivate.guard';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit, OnDestroy, CanComponentDeactivate {
	public frm: FormGroup;
	private isAuthenticated:boolean = false;
  public user: User;
	private userSub: Subscription;

  constructor (private authService: AuthService) {}
 
	ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!this.user;
    });
		
		this.frm = new FormGroup({
      'orNo': new FormControl(null, Validators.required)
    });
	}

  onSubmit() {
    
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.isAuthenticated && !this.frm.untouched) {
      return confirm('Do you want to discard the changes?');
    }
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
  }
}
