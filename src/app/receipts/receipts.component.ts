import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { ToWords } from 'to-words';
import { ReceiptsService } from './receipts.service';
import { InvoiceFieldsInput, Receipt, ReceiptFieldsInput } from './receipt.model';
import { CanComponentDeactivate } from '../shared/can-deactivate.guard';
import { AuthService } from '../auth/auth.service';
import { FormulaService } from '../shared/formula.service';
import { FormatService } from '../shared/format.service';
import { User } from '../auth/user.model';
import { Role } from '../shared/roles.enum';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptsComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  public frm: FormGroup;
  private isAuthenticated:boolean = false;
  public isEditReceipt:boolean = false;
  public isAdmin:boolean = false;
  public user: User;
  public roles: typeof Role = Role;
  private userSub: Subscription;
  private customerNameSub: Subscription;
  private customerNameSearchSub: Subscription;  
  private orSub: Subscription;
  private orSearchSub: Subscription; 
  
  public customerNameFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);
  public invoiceNoFiltered: Array<ReplaySubject<any>> = new Array<ReplaySubject<any>>();
  public orFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);

  private receiptFieldsInput: ReceiptFieldsInput;
  private rowLimitInvoice: number;

  private invoicesData = []
  private redoReceiptsData= [];

  constructor(private route: ActivatedRoute, private receiptService: ReceiptsService, private authService: AuthService, private sanitizer: DomSanitizer, private formulaService: FormulaService, private f: FormatService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!user;
    });

    this.route.data.subscribe((data: Data) => {
      this.invoicesData = data['receiptInvoices'];
      if (this.user.rolename.some(role => this.receiptService.rolesReceipt.includes(role))) {
        this.redoReceiptsData = data['receiptRedoReceipts'];
        if (this.user.rolename.some(role => [Role.receiptadmin,Role.admin].includes(role))) {
          this.isAdmin = true;
        } else {
          this.isEditReceipt = true;
        }
      }
    });

    this.frm = new FormGroup({
      'or': new FormControl(null, Validators.required),
      'orSearch': new FormControl(null),
      'customerName': new FormControl(null, Validators.required),
      'customerNameSearch': new FormControl(null),
      'rowLimitInvoice': new FormControl(null),
      'dt': new FormControl(null, Validators.required),
      'amountInWords': new FormControl(null),
      'amountReceived': new FormControl(null),
      'invoices': new FormArray([])
    });

    this.customerNameSub = this.frm.get('customerName').valueChanges.subscribe((value) => {
      this.receiptFieldsInput = value;
      this.onChangeValues();
      this.onChangeRowLimitInvoice();
    });

    this.customerNameSearchSub = this.frm.get('customerNameSearch').valueChanges.subscribe((value) => {
      if (!this.invoicesData.slice()) {
        return;
      }
      
      let customerNameSearch = value;
      if (!customerNameSearch) {
        this.customerNameFiltered.next(this.invoicesData.slice());
        return;
      } else {
        // customerNameSearch = customerNameSearch.toLowerCase();
        customerNameSearch = '^'+customerNameSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.customerNameFiltered.next(
        // this.invoicesData.slice().filter(option => option.custname.toLowerCase().startsWith(customerNameSearch))
        this.invoicesData.slice().filter(option => {
          const regexp = new RegExp(customerNameSearch,'ig');
          return regexp.test(option.custname);
        })
      );
    });

    this.orSub = this.frm.get('or').valueChanges.subscribe((value) => {
      if (this.isEditReceipt) {
        this.receiptFieldsInput = value;
        if (!!this.receiptFieldsInput) {
          this.frm.patchValue({'customerName': this.receiptFieldsInput.custname}, {emitEvent: false});
          this.frm.patchValue({'dt': formatDate(this.receiptFieldsInput.dateor, 'yyyy-MM-dd', 'en-US')});
        }
        this.onChangeRowLimitInvoice();
      }
    });

    this.orSearchSub = this.frm.get('orSearch').valueChanges.subscribe((value) => {
      if (!this.redoReceiptsData.slice()) {
        return;
      }
      
      let orSearch = value;
      if (!orSearch) {
        this.orFiltered.next(this.redoReceiptsData.slice());
        return;
      } else {
        // orSearch = orSearch.toLowerCase();
        orSearch = '^'+orSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.orFiltered.next(
        // this.redoReceiptsData.slice().filter(option => option.agentname.toLowerCase().startsWith(orSearch))
        this.redoReceiptsData.slice().filter(option => {
          const regexp = new RegExp(orSearch,'ig');
          return regexp.test(option.orno);
        })
      );
    });
      
    this.customerNameFiltered.next(this.invoicesData.slice());
    this.orFiltered.next(this.redoReceiptsData.slice());

  }
  
  onChangeValues() {
    // this.frm.patchValue({'dt': new Date().toISOString().slice(0, 10)});
    this.rowLimitInvoice = +localStorage.getItem('rowLimitInvoice');
    if (!this.rowLimitInvoice) {
      this.rowLimitInvoice = 1;
      this.frm.patchValue({'rowLimitInvoice': this.rowLimitInvoice});
    } else if (this.rowLimitInvoice > this.onGetCountInvoices()) {
      this.frm.patchValue({'rowLimitInvoice': this.onGetCountInvoices()});
    } else {
      this.frm.patchValue({'rowLimitInvoice': this.rowLimitInvoice});
    }
  }

  onChangeRowLimitInvoice(event?) {
    if (!!this.receiptFieldsInput) {
      this.frm.setControl('invoices', new FormArray([]));
      this.invoiceNoFiltered = [];
      const invoiceNos = this.receiptFieldsInput.invoices.slice();
      if (!!event) {
        this.rowLimitInvoice = +event.target.value;
        this.frm.patchValue({'rowLimitInvoice': this.rowLimitInvoice});
        localStorage.setItem('rowLimitInvoice', this.rowLimitInvoice.toString());
      }
      let l = 0;
      if (this.isEditReceipt)  {
        l = invoiceNos.length;
      } else {
        l = Math.min(...[+this.frm.get('rowLimitInvoice').value, invoiceNos.length]);
      }
      for (let i=0;(i<l);++i) {
        this.onAddInvoice(false);
        const index = this.controls.length - 1;
        this.invoices.at(index).patchValue({
          'invoiceNo': (this.isEditReceipt ? invoiceNos[i].invoiceno : invoiceNos[i]),
          'rebate': this.f.s(+invoiceNos[i].rebate,0),
          'retention': this.f.s(+invoiceNos[i].retention,0),
          'penalty': this.f.s(+invoiceNos[i].penalty,0),
          'govShare': this.f.s(+invoiceNos[i].govshare,0),
          ['withheld'+this.onGetWithheld(0)]: this.f.s(+invoiceNos[i].withheld0,0),
          ['withheld'+this.onGetWithheld(1)]: this.f.s(+invoiceNos[i].withheld1,0),
          ['withheld'+this.onGetWithheld(2)]: this.f.s(+invoiceNos[i].withheld2,0)
        });
        this.onChangeInvoice(index, invoiceNos[i]);
      }
      // invoiceNos.forEach((e) => {});
    }
  }

  onChangeInvoice(index: number, e: InvoiceFieldsInput) {
    if (!!e) {
      this.invoices.at(index).patchValue({'accountid': e.accountid});

      this.invoices.at(index).patchValue({'dt': formatDate(e.dateinvoice, 'MMM dd, yyyy', 'en-US')});
      this.invoices.at(index).patchValue({'jobOrderNo': e.joborderno});

      this.invoices.at(index).patchValue({'sellingPrice': this.formulaService.getProduct(this.formulaService.getQuotient(e.sellingprice, e.qtyjoborder), e.qtyinvoice)});
      this.invoices.at(index).patchValue({'docStamps': this.formulaService.getProduct(this.formulaService.getQuotient(e.docstamps, e.qtyjoborder), e.qtyinvoice)});
  
      this.invoices.at(index).patchValue({'netOfVat': this.formulaService.getNetOfVat(this.invoices.at(index).get('sellingPrice').value)});
      this.invoices.at(index).patchValue({'vat': this.formulaService.getVatAmount(this.invoices.at(index).get('sellingPrice').value)});
      this.invoices.at(index).patchValue({'invoiceAmount': this.formulaService.getSum([this.invoices.at(index).get('sellingPrice').value, this.invoices.at(index).get('docStamps').value], 0)});

      this.onChangeTotalAmount(index);
    }
  }

  onChangeTotalAmount(index: number) {
    this.invoices.at(index).patchValue({'totalAmount': this.formulaService.getSum([
      this.invoices.at(index).get('invoiceAmount').value, 
      "-"+(+this.f.n(this.invoices.at(index).get('rebate').value)).toString(), 
      "-"+(+this.f.n(this.invoices.at(index).get('retention').value)).toString(), 
      "-"+(+this.f.n(this.invoices.at(index).get('penalty').value)).toString(), 
      "-"+(+this.f.n(this.invoices.at(index).get('govShare').value)).toString(), 
      "-"+(+this.f.n(this.invoices.at(index).get('withheld'+this.onGetWithheld(0)).value)).toString(), 
      "-"+(+this.f.n(this.invoices.at(index).get('withheld'+this.onGetWithheld(1)).value)).toString(), 
      "-"+(+this.f.n(this.invoices.at(index).get('withheld'+this.onGetWithheld(2)).value)).toString()
    ])});
    this.onChangesAmountReceived();
  }

  onChangesAmountReceived() {
    this.frm.patchValue({'amountReceived': this.f.s(this.onCalculateInvoicesAmount(), 0)});
    const toWords = new ToWords({
      localeCode: 'en-US',
      converterOptions: {
          currency: true,
          ignoreDecimal: false,
          ignoreZeroCurrency: false,
          doNotAddOnly: false,
          currencyOptions: { 
              name: 'Peso',
              plural: 'Pesos',
              symbol: '',
              fractionalUnit: {
                  name: 'Centavo',
                  plural: 'Centavos',
                  symbol: '',
              },
          }
      }
    });
    this.frm.patchValue({'amountInWords': toWords.convert(+this.f.n(this.frm.get('amountReceived').value))});
  }

  async onSubmit() {
    const res = await this.receiptService.addReceipt(new Receipt({
      OR: (this.isEditReceipt ? this.frm.get('or').value.receiptid : this.frm.get('or').value),
      isEditReceipt: String(this.isEditReceipt),
      dt: this.frm.get('dt').value,
      invoices: this.controls.reduce((acc, cur) => acc.concat({
        invoice: (this.isEditReceipt ? cur.value.accountid : cur.value.invoiceNo.invoiceno),
        rebate: +this.f.n(cur.value.rebate),
        retention: +this.f.n(cur.value.retention),
        penalty: +this.f.n(cur.value.penalty),
        govshare: +this.f.n(cur.value.govShare),
        withheld0: +this.f.n(eval("cur.value.withheld"+this.onGetWithheld(0))),
        withheld1: +this.f.n(eval("cur.value.withheld"+this.onGetWithheld(1))),
        withheld2: +this.f.n(eval("cur.value.withheld"+this.onGetWithheld(2)))
      }), []),
    }));
    if (!!res.Success) {
      alert("Successfully submitted!");
    } else {
      alert("Submission has failed!\n\n" + res.Error);
    }
    this.onClear();
  }

  async onClear() {
    this.invoicesData = <Array<any>>await this.receiptService.getInvoices();
    if (this.user.rolename.some(role => this.receiptService.rolesReceipt.includes(role))) {
      this.redoReceiptsData = <Array<any>>await this.receiptService.getRedoReceipts();
    }
    this.onReset();
  }

  onReset() {
    this.frm.setControl('invoices', new FormArray([]));
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

  onToggleReceiptControl(): boolean {
    this.onReset();
    return this.isEditReceipt = !this.isEditReceipt;
  }

  onGetCountInvoices(): number {
    return (!!this.receiptFieldsInput ? this.receiptFieldsInput.invoices.slice().length : 0)
  }

  isNullRowLimitInvoice(): boolean {
    return (this.frm.get('rowLimitInvoice').value === null) ;
  }

  onGetVat() {
    return this.formulaService.getVatRate();
  }

  onGetWithheld(index: number) {
    return this.formulaService.getWithheldRate(index);
  }
  
  // OPTION
  onGetInvoices(selectedInvoices=[]) {
    let invoices = this.receiptFieldsInput.invoices.slice();
    return invoices.filter(a => !selectedInvoices.map(b=>b).includes(a.invoiceno.toString()));
  }

  // EXCLUDED selected
  onGetSelectedInvoices(i: number) {
    let selectedInvoices = [];
    const ctrls = this.controls.slice();
    ctrls.forEach((element, index) => {
      const selectedValue = element.value.invoiceNo;
      if (!!selectedValue && (index !== i)) {
        selectedInvoices.push(selectedValue.invoiceno);
      }
    });
    return selectedInvoices;
  }

  // HANDLER Click invoiceNo
  onClickInvoiceNo(event: any, i: number) {
    this.invoiceNoFiltered[i].next(this.onGetInvoices(this.onGetSelectedInvoices(i)));
  }

  // HANDLER invoiceNo
  onSelectionChangeInvoiceNo(event: any, i: number) {
    // const ctrls = this.controls.slice();
    // ctrls.reverse().forEach((element, index) => {
    //   const idx = ctrls.length - index - 1;
    //   if ((event.value.invoiceno === element.value.invoiceNo.invoiceno) && (idx !== i)) {
    //     this.onDeleteInvoice(idx);
    //   }
    // });
    this.onChangeInvoice(i, event.value);
  }

  // HANDLER invoiceNoSearch
  onKeyupInvoiceNoSearch(event: any, i: number) {
    if (!this.onGetInvoices(this.onGetSelectedInvoices(i))) {
      return;
    }
    
    let invoiceNoSearch = this.invoices.at(i).get('invoiceNoSearch').value;
    if (!invoiceNoSearch) {
      this.invoiceNoFiltered[i].next(this.onGetInvoices(this.onGetSelectedInvoices(i)));
      return;
    } else {
      // invoiceNoSearch = invoiceNoSearch.toLowerCase();
      invoiceNoSearch = '^'+invoiceNoSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
    }
    
    this.invoiceNoFiltered[i].next(
      // this.onGetInvoices(this.onGetSelectedInvoices(i)).filter(option => option.invoiceno.toLowerCase().startsWith(invoiceNoSearch))
      this.onGetInvoices(this.onGetSelectedInvoices(i)).filter(option => {
        const regexp = new RegExp(invoiceNoSearch,'ig');
        return regexp.test(option.invoiceno);
      })
    );
  }

  // HANDLER 
  onChangeDeductions(event: any, i: number) {
    this.onChangeTotalAmount(i);
  }

  onCalculateInvoicesWithheld(i: number) {
    const rate: string = this.onGetWithheld(i);
    const ctrls = this.controls.slice();
    ctrls.forEach((element, index) => {
      if (!!element.value.invoiceAmount) {
        this.invoices.at(index).patchValue({['withheld'+rate]: this.formulaService.getWithheldAmount(element.value.invoiceAmount, i)});
        this.onChangeTotalAmount(index);
      }
    });
  }
  
  onCalculateInvoicesAmount(): number {
    let invoicesAmount = 0;
    const ctrls = this.controls.slice();
    ctrls.forEach((element) => {
      if (!!element.value.totalAmount) {
        invoicesAmount += +this.f.n(element.value.totalAmount);
      }
    });
    return +invoicesAmount;
  }

  onAddInvoice(setLimit: boolean = true) {
    (<FormArray>this.frm.get('invoices')).push(
      new FormGroup({
        'accountid': new FormControl(null),
        'invoiceNo': new FormControl(null, Validators.required),
        'invoiceNoSearch': new FormControl(null),
        'dt': new FormControl(null),
        'jobOrderNo': new FormControl(null),
        'netOfVat': new FormControl(null),
        'vat': new FormControl(null),
        'sellingPrice': new FormControl(null),
        'docStamps': new FormControl(null),
        'invoiceAmount': new FormControl(null),
        
        'rebate': new FormControl(null),
        'retention': new FormControl(null),
        'penalty': new FormControl(null),
        'govShare': new FormControl(null),
        ['withheld'+this.onGetWithheld(0)]: new FormControl(null),
        ['withheld'+this.onGetWithheld(1)]: new FormControl(null),
        ['withheld'+this.onGetWithheld(2)]: new FormControl(null),
        
        'totalAmount': new FormControl(null)
      })
    );
    this.invoiceNoFiltered.push(new ReplaySubject<any>(1));
    const index = this.invoiceNoFiltered.length - 1;
    this.invoiceNoFiltered[index].next(this.onGetInvoices(this.onGetSelectedInvoices(index)));
    if (setLimit) { 
      this.onSetValueRowLimitInvoice(); 
    } 
  }

  onDeleteInvoice(index: number) {
    (<FormArray>this.frm.get('invoices')).removeAt(index);
    this.invoiceNoFiltered.splice(index, 1);
    this.onChangesAmountReceived();
    this.onSetValueRowLimitInvoice();
  }
  
  onSetValueRowLimitInvoice() {
    this.frm.patchValue({'rowLimitInvoice': this.controls.length});
    // this.frm.get("rowLimitInvoice").setValue(this.controls.length, {emitEvent: false});
  }

  get invoices() {
    return this.frm.get('invoices') as FormArray;
  }

  get controls() {
    return (<FormArray>this.frm.get('invoices')).controls;
  }

  get onSetEnable(): boolean {
    return !(this.frm.controls.invoices.valid && (!!this.receiptFieldsInput ? this.controls.length < this.receiptFieldsInput.invoices.slice().length : false))
  }
  
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.isAuthenticated && (!this.frm.untouched || this.controls.length)) {
      return confirm('Do you want to discard the changes?');
    }
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.customerNameSub) { this.customerNameSub.unsubscribe; }
    if (this.customerNameSearchSub) { this.customerNameSearchSub.unsubscribe(); }
    if (this.orSub) { this.orSub.unsubscribe(); }
    if (this.orSearchSub) { this.orSearchSub.unsubscribe(); }
  }
}
