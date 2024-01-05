import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { HyperFormula } from 'hyperformula';
import { FormulaService } from '../shared/formula.service';
import { FormatService } from '../shared/format.service';
import { CanComponentDeactivate } from '../shared/can-deactivate.guard';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../shared/api.service';
import { User } from '../auth/user.model';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, CanComponentDeactivate {
  public frm: FormGroup;
	private isAuthenticated:boolean = false;
  public user: User;
  private userSub: Subscription;

  constructor (private authService: AuthService, private apiService: ApiService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!this.user;
    });


    this.frm = new FormGroup({});
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
