import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  public frm: FormGroup;
  @Output() close = new EventEmitter<void>();

  constructor (private apiService: ApiService) {}

  ngOnInit() {
    this.frm = new FormGroup({
      'oldPwd': new FormControl(null, Validators.required),
      'newPwd': new FormControl(null, [Validators.required, Validators.minLength(8)]),
      'confirmPwd': new FormControl(null, Validators.required)
    }, this.matchPwds);    
  }

  matchPwds(control: AbstractControl): {[s: string]: boolean} {
    let newPwd2 = control.get('newPwd');
    let confirmPwd2 = control.get('confirmPwd');
    if(newPwd2.value !== confirmPwd2.value){
      return { pwdsDontMatch: true };
    }
    return null;
  }

  get oldPwd(){
    return this.frm.get('oldPwd');
  }

   get newPwd(){
    return this.frm.get('newPwd');
  }

   get confirmPwd(){
    return this.frm.get('confirmPwd');
  }

  async changePassword() {
    const res = await this.apiService.postChangePassword(this.oldPwd.value, this.newPwd.value);
    if (!!res.Success) {
      alert("Password has been successfully changed!");
      this.onClose();
    } else {
      alert("Password Change Failed!\n\n" + res.Error);
    }
    this.frm.reset();
  }

  onClose() {
    this.close.emit();
  }
}
