import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../shared/api.service';
import { User } from '../auth/user.model';
import { CanComponentDeactivate } from '../shared/can-deactivate.guard';

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css']
})
export class InquiryComponent implements OnInit, CanComponentDeactivate {
  public frm: FormGroup;
	private isAuthenticated:boolean = false;
  public user: User;
  private userSub: Subscription;

  public masterData = [];

  constructor (private authService: AuthService, private apiService: ApiService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!this.user;
    });


    this.frm = new FormGroup({
      'jobOrder': new FormControl(null),
      'invoice': new FormControl(null),
      'or': new FormControl(null)
    });
  }

  async onSubmit() {
    this.masterData = <Array<any>>await this.apiService.postInquiry(String(this.frm.get('jobOrder').value), String(this.frm.get('invoice').value), String(this.frm.get('or').value));
  }

  onClear() {
    this.masterData = []
    this.frm.reset();
  }

  onGetCountMasterData() {
    return this.masterData.slice().length
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
