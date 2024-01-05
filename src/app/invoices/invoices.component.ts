import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { CanComponentDeactivate } from '../shared/can-deactivate.guard';
import { AuthService } from '../auth/auth.service';
import { InvoicesService } from './invoices.service';
import { InvoiceFieldsInput, Invoice } from './invoice.model';
import { FormulaService } from '../shared/formula.service';
import { FormatService } from '../shared/format.service';
import { User } from '../auth/user.model';
import { Role } from '../shared/roles.enum';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css']
})
export class InvoicesComponent implements OnInit, OnDestroy, CanComponentDeactivate  {
  public frm: FormGroup;
  private isAuthenticated:boolean = false;
  public isEditInvoice:boolean = false;
  public isAdmin:boolean = false;
  public user: User;
  public roles: typeof Role = Role;
  private userSub: Subscription;
  private jobOrderNoSub: Subscription;
  private quantitySub: Subscription;
  private jobOrderNoSearchSub: Subscription;  
  private invoiceSub: Subscription;
  private invoiceSearchSub: Subscription; 
  
  public jobOrderNoFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);
  public invoiceFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);

  private invoiceFieldsInput: InvoiceFieldsInput;

  private jobOrdersData = [];
  private redoInvoicesData = [];

  constructor(private route: ActivatedRoute, private invoicesService: InvoicesService, private authService: AuthService, private formulaService: FormulaService, private f: FormatService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!this.user;
    });
    
    this.route.data.subscribe((data: Data) => {
        this.jobOrdersData = data['invoiceJoborders'];
        if (this.user.rolename.some(role => this.invoicesService.rolesInvoice.includes(role))) {
          this.redoInvoicesData = data['invoiceRedoInvoices'];
          if (this.user.rolename.some(role => [Role.invoiceadmin,Role.admin].includes(role))) {
            this.isAdmin = true;
          } else {
            this.isEditInvoice = true;
          }
        }
    });
    
    this.frm = new FormGroup({
      'customerName': new FormControl(null),
      'jobOrderNo': new FormControl(null, Validators.required),
      'jobOrderNoSearch': new FormControl(null),
      'dt': new FormControl(null, Validators.required),
      
      'quantity': new FormControl(null, [Validators.required, this.quantityOutOfRange.bind(this)]),
      'unitMeasure': new FormControl(null),
      'formTitle': new FormControl(null),
      'netOfVatUnit': new FormControl(null),
      'netOfVatTotal': new FormControl(null),

      'deliveryReceipt': new FormControl(''),
      
      'netOfVat': new FormControl(null),
      'vat': new FormControl(null),
      'sellingPrice': new FormControl(null),
      'docStamps': new FormControl(null),
      'invoiceAmount': new FormControl(null),

      'invoice': new FormControl(null, Validators.required),
      'invoiceSearch': new FormControl(null)
    });

    this.quantitySub = this.frm.get('quantity').valueChanges.subscribe(() => {this.onValueChanges();});

    this.jobOrderNoSub = this.frm.get('jobOrderNo').valueChanges.subscribe((value) => {
      this.invoiceFieldsInput = value;
      if (!!this.invoiceFieldsInput) {
        this.frm.patchValue({
          'customerName': this.invoiceFieldsInput.custname,
          'dt': null,
          
          'quantity': null,
          'unitMeasure': this.invoiceFieldsInput.unitmeasure,
          'formTitle': this.invoiceFieldsInput.formtitle,
          'netOfVatUnit': null,
          'netOfVatTotal': null,

          'deliveryReceipt': '',
          
          'netOfVat': null,
          'vat': null,
          'sellingPrice': null,
          'docStamps': null,
          'invoiceAmount': null,
    
          'invoice': null
        });
      }
      // this.frm.get('quantity').setValidators([Validators.required, this.quantityOutOfRange.bind(this)])
      // this.frm.get('quantity').updateValueAndValidity()
    });

    this.jobOrderNoSearchSub = this.frm.get('jobOrderNoSearch').valueChanges.subscribe((value) => {
      if (!this.jobOrdersData.slice()) {
        return;
      }
      
      let jobOrderNoSearch = value;
      if (!jobOrderNoSearch) {
        this.jobOrderNoFiltered.next(this.jobOrdersData.slice());
        return;
      } else {
        // jobOrderNoSearch = jobOrderNoSearch.toLowerCase();
        jobOrderNoSearch = '^'+jobOrderNoSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.jobOrderNoFiltered.next(
        // this.jobOrdersData.slice().filter(option => option.joborderno.toLowerCase().startsWith(jobOrderNoSearch))
        this.jobOrdersData.slice().filter(option => {
          const regexp = new RegExp(jobOrderNoSearch,'ig');
          return regexp.test(option.joborderno);
        })
      );
    });

    this.invoiceSub = this.frm.get('invoice').valueChanges.subscribe((value) => {
      if (this.isEditInvoice) {
        this.invoiceFieldsInput = value;
        if (!!this.invoiceFieldsInput) {
          this.frm.patchValue({'jobOrderNo': this.invoiceFieldsInput.joborderno}, {emitEvent: false});
          this.frm.patchValue({
            'customerName': this.invoiceFieldsInput.custname,
            'dt': formatDate(this.invoiceFieldsInput.dt, 'yyyy-MM-dd', 'en-US'),
            'quantity': this.f.s(+this.invoiceFieldsInput.qtyinvoice, 0, 0, 0),
            'unitMeasure': this.invoiceFieldsInput.unitmeasure,
            'formTitle': this.invoiceFieldsInput.formtitle,
            'deliveryReceipt': this.invoiceFieldsInput.deliveryreceipt
          });
        }
      }
    });

    this.invoiceSearchSub = this.frm.get('invoiceSearch').valueChanges.subscribe((value) => {
      if (!this.redoInvoicesData.slice()) {
        return;
      }
      
      let invoiceSearch = value;
      if (!invoiceSearch) {
        this.invoiceFiltered.next(this.redoInvoicesData.slice());
        return;
      } else {
        // invoiceSearch = invoiceSearch.toLowerCase();
        invoiceSearch = '^'+invoiceSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.invoiceFiltered.next(
        // this.redoInvoicesData.slice().filter(option => option.agentname.toLowerCase().startsWith(invoiceSearch))
        this.redoInvoicesData.slice().filter(option => {
          const regexp = new RegExp(invoiceSearch,'ig');
          return regexp.test(option.invoiceno);
        })
      );
    });
      
    this.jobOrderNoFiltered.next(this.jobOrdersData.slice());
    this.invoiceFiltered.next(this.redoInvoicesData.slice());
  }

  quantityOutOfRange(control: FormControl): {[s: string]: boolean} {
    if (!!this.invoiceFieldsInput) {
      if ((+this.f.n(control.value) < 1) || (+this.f.n(control.value) > +this.invoiceFieldsInput.qtyremaining)) {
        return {'quantityOutOfRange': true}
      }
    }
    return null;
  }
  
  onValueChanges() {
    if (!!this.invoiceFieldsInput) {
      this.frm.patchValue({'sellingPrice': this.formulaService.getProduct(this.formulaService.getQuotient(this.invoiceFieldsInput.sellingprice, this.invoiceFieldsInput.qtyjoborder), this.frm.get('quantity').value)});
      this.frm.patchValue({'docStamps': this.formulaService.getProduct(this.formulaService.getQuotient(this.invoiceFieldsInput.docstamps, this.invoiceFieldsInput.qtyjoborder), this.frm.get('quantity').value)});
  
      this.frm.patchValue({'netOfVatTotal': this.formulaService.getNetOfVat(this.frm.get('sellingPrice').value)});
      this.frm.patchValue({'netOfVatUnit': this.formulaService.getQuotient(this.frm.get('netOfVatTotal').value, this.frm.get('quantity').value, 0)});
  
      this.frm.patchValue({'netOfVat': this.formulaService.getNetOfVat(this.frm.get('sellingPrice').value)});
      this.frm.patchValue({'vat': this.formulaService.getVatAmount(this.frm.get('sellingPrice').value)});
      this.frm.patchValue({'invoiceAmount': this.formulaService.getSum([this.frm.get('sellingPrice').value, this.frm.get('docStamps').value], 0)});
    }
  }

  async onSubmit() {
    const res = await this.invoicesService.addInvoice(new Invoice({
      invoice: (this.isEditInvoice ? this.frm.get('invoice').value.invoiceid : this.frm.get('invoice').value),
      isEditInvoice: String(this.isEditInvoice),
      jobOrderNo: (this.isEditInvoice ? this.frm.get('jobOrderNo').value : this.frm.get('jobOrderNo').value.joborderno),
      dt: this.frm.get('dt').value,
      qtyinvoice: this.frm.get('quantity').value,
      deliveryReceipt: this.frm.get('deliveryReceipt').value
    }));
    if (!!res.Success) {
      alert("Successfully submitted!");
    } else {
      alert("Submission has failed!\n\n" + res.Error);
    }
    this.onClear();
  }

  async onClear() {
    this.jobOrdersData = <Array<any>>await this.invoicesService.getJobOrders();
    if (this.user.rolename.some(role => this.invoicesService.rolesInvoice.includes(role))) {
      this.redoInvoicesData = <Array<any>>await this.invoicesService.getRedoInvoices();
    }
    this.onReset();
  }

  onReset() {
    this.frm.reset();
  }

  addCommas(event, minIntegerDigits?: number, minFractionDigits?: number, maxFractionDigits?: number) {
    let value = this.f.s(+this.f.n(event.target.value), minIntegerDigits, minFractionDigits, maxFractionDigits)
    event.target.value = value;
    this.frm.patchValue({[event.target.id]: value});
  }

  removeCommas(event) {
    event.target.value = this.f.n(event.target.value);
  }

  onGetInvoiceRemainingBalance(formatted: boolean = false) {
    const invoiceRemainingBalance = (!!this.invoiceFieldsInput ? this.invoiceFieldsInput.qtyremaining : "0");
    if (formatted) {
      return this.f.s(+invoiceRemainingBalance, 0, 0, 0);
    } else {
      return +invoiceRemainingBalance;
    }
  }

  onIsQuantityExceed(): boolean {
    return +this.f.n(this.frm.get('quantity').value) > +this.onGetInvoiceRemainingBalance();
  }

  onGetVat() {
    return this.formulaService.getVatRate();
  }

  onToggleInvoiceControl(): boolean {
    this.onReset();
    return this.isEditInvoice = !this.isEditInvoice;
  }
  
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.isAuthenticated && !this.frm.untouched) {
      return confirm('Do you want to discard the changes?');
    }
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.jobOrderNoSub) { this.jobOrderNoSub.unsubscribe; }
    if (this.quantitySub) { this.quantitySub.unsubscribe(); }
    if (this.jobOrderNoSearchSub) { this.jobOrderNoSearchSub.unsubscribe(); }
    if (this.invoiceSub) { this.invoiceSub.unsubscribe(); }
    if (this.invoiceSearchSub) { this.invoiceSearchSub.unsubscribe(); }
  }
}
