import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { CanComponentDeactivate } from '../shared/can-deactivate.guard';
import { JobOrdersService } from './job-orders.service';
import { JobOrder, JobOrderFieldsInput } from './job-order.model';
import { AuthService } from '../auth/auth.service';
import { FormulaService } from '../shared/formula.service';
import { FormatService } from '../shared/format.service';
import { User } from '../auth/user.model';
import { Role } from '../shared/roles.enum';
import { environment } from  "../../environments/environment";

@Component({
  selector: 'app-job-orders',
  templateUrl: './job-orders.component.html',
  styleUrls: ['./job-orders.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class JobOrdersComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  public frm: FormGroup;
  private isAuthenticated:boolean = false;
  public isNewCustomerName:boolean = false;
  public isEditJobOrder:boolean = false;
  public isAdmin:boolean = false;
  public user: User;
  public roles: typeof Role = Role;
  private userSub: Subscription;
  private accountManagerSub: Subscription;
  private quantitySub: Subscription;
  private materialCostTotalSub: Subscription;
  private processCostTotalSub: Subscription;
  private otherCostTotalSub: Subscription;
  private totalTransferSub: Subscription;
  private sellingPriceTotalSub: Subscription;
  private docStampsTotalSub: Subscription;  
  private discountTotalSub: Subscription;  
  private shippingHandlingTotalSub: Subscription;  
  private dealerCommTotalSub: Subscription;  
  private customerNameSearchSub: Subscription; 
  private accountManagerSearchSub: Subscription; 
  private jobOrderSub: Subscription;
  private jobOrderSearchSub: Subscription; 
  
  public customerNameFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);
  public accountManagerFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);
  public salesRepNameFiltered: Array<ReplaySubject<any>> = new Array<ReplaySubject<any>>();
  public jobOrderFiltered: ReplaySubject<any> = new ReplaySubject<any>(1);

  private jobOrderFieldsInput: JobOrderFieldsInput;

  private agentsData = [];
  private customersData = [];
  public unitMeasuresData = [];
  private redoJobOrdersData= [];
  
  constructor (private route: ActivatedRoute, private jobOrdersService: JobOrdersService, private authService: AuthService, private sanitizer: DomSanitizer, private formulaService: FormulaService, private f: FormatService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!this.user;
    });

    this.route.data.subscribe((data: Data) => {
      this.agentsData = data['joborderAgents'];
      this.customersData = data['joborderCustomers'];
      this.unitMeasuresData = data['joborderUnitmeasures'];
      if (this.user.rolename.some(role => this.jobOrdersService.rolesInvoice.includes(role))) {
        this.redoJobOrdersData = data['joborderRedoJobOrders'];
        if (this.user.rolename.some(role => [Role.joborderadmin,Role.admin].includes(role))) {
          this.isAdmin = true;
        } else {
          this.isEditJobOrder = true;
        }
      }
    });

    const testMode = !environment.production;

    const orderRef = (testMode ? '202300011231-0' : '');
    const dt = (testMode ? new Date().toISOString().slice(0, 10) : null);
    
    const formTitle = (testMode ? 'Customized Check' : null);
    const quantity = (testMode ? this.f.s(10000, 0, 0, 0) : null);
    
    const materialCostTotal = (testMode ? this.f.s(10000, 0) : null);
    const processCostTotal = (testMode ? this.f.s(15000, 0) : null);
    const otherCostTotal = (testMode ? this.f.s(5000, 0) : null);
    const totalTransfer = (testMode ? this.f.s(63400, 0) : null);
    
    const sellingPriceTotal = (testMode ? this.f.s(69800, 0) : null);
    const docStampsTotal = (testMode ? this.f.s(30000, 0) : null);
    const discountTotal = (testMode ? this.f.s(5000, 0) : null);
    const shippingHandlingTotal = (testMode ? this.f.s(3000, 0) : null);
    const dealerCommTotal = (testMode ? this.f.s(17000, 0) : null);
    
    const jobOrder = (testMode ? '020359' : null);

    this.frm = new FormGroup({
      'customerName': new FormControl(null, Validators.required),
      'customerNameSearch': new FormControl(null),
      'orderRef': new FormControl(orderRef),
      'dt': new FormControl(dt, Validators.required),
      
      'formTitle': new FormControl(formTitle, Validators.required),
      'quantity': new FormControl(quantity, Validators.required),
      'unitMeasure': new FormControl(null, Validators.required),
      
      'materialCostUnit': new FormControl(null),
      'materialCostTotal': new FormControl(materialCostTotal, Validators.required),
      'processCostUnit': new FormControl(null),
      'processCostTotal': new FormControl(processCostTotal, Validators.required),
      'otherCostUnit': new FormControl(null),
      'otherCostTotal': new FormControl(otherCostTotal),
      'unitCost': new FormControl(null),
      'totalCost': new FormControl(null),
      'unitTransfer': new FormControl(null),
      'totalTransfer': new FormControl(totalTransfer),
      'marginUnit': new FormControl(null),
      'marginTotal': new FormControl(null),
      
      'netOfVatUnit': new FormControl(null),
      'netOfVatTotal': new FormControl(null),
      'vatUnit': new FormControl(null),
      'vatTotal': new FormControl(null),
      'sellingPriceUnit': new FormControl(null),
      'sellingPriceTotal': new FormControl(sellingPriceTotal, Validators.required),
      'docStampsUnit': new FormControl(null),
      'docStampsTotal': new FormControl(docStampsTotal),
      'discountUnit': new FormControl(null),
      'discountTotal': new FormControl(discountTotal),
      'shippingHandlingUnit': new FormControl(null),
      'shippingHandlingTotal': new FormControl(shippingHandlingTotal),
      'invoiceAmountUnit': new FormControl(null),
      'invoiceAmountTotal': new FormControl(null),
      'dealerCommUnit': new FormControl(null),
      'dealerCommTotal': new FormControl(dealerCommTotal),
      'callableUnit': new FormControl(null),
      'callableTotal': new FormControl(null),
      
      'accountManager': new FormControl(null, Validators.required),
      'accountManagerSearch': new FormControl(null),
      'accountManagerRate': new FormControl(null),
      'salesReps': new FormArray([]),
      'jobOrder': new FormControl(jobOrder, Validators.required),
      'jobOrderSearch': new FormControl(null)
    });

    this.quantitySub = this.frm.get('quantity').valueChanges.subscribe(() => {this.onValueChanges();});
    this.materialCostTotalSub = this.frm.get('materialCostTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.processCostTotalSub = this.frm.get('processCostTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.otherCostTotalSub = this.frm.get('otherCostTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.totalTransferSub = this.frm.get('totalTransfer').valueChanges.subscribe(() => {this.onValueChanges();});
    this.sellingPriceTotalSub = this.frm.get('sellingPriceTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.docStampsTotalSub = this.frm.get('docStampsTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.discountTotalSub = this.frm.get('discountTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.shippingHandlingTotalSub = this.frm.get('shippingHandlingTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    this.dealerCommTotalSub = this.frm.get('dealerCommTotal').valueChanges.subscribe(() => {this.onValueChanges();});
    
    this.customerNameSearchSub = this.frm.get('customerNameSearch').valueChanges.subscribe((value) => {
      if (!this.customersData.slice()) {
        return;
      }
      
      let customerNameSearch = value;
      if (!customerNameSearch) {
        this.customerNameFiltered.next(this.customersData.slice());
        return;
      } else {
        // customerNameSearch = customerNameSearch.toLowerCase();
        customerNameSearch = '^'+customerNameSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.customerNameFiltered.next(
        // this.customersData.slice().filter(option => option.custname.toLowerCase().startsWith(customerNameSearch))
        // this.customersData.slice().filter(option => option.custname.toLowerCase().includes(customerNameSearch))
        this.customersData.slice().filter(option => {
          const regexp = new RegExp(customerNameSearch,'ig');
          return regexp.test(option.custname);
        })
      );
    });

    // HANDLER accountManager
    this.accountManagerSub = this.frm.get('accountManager').valueChanges.subscribe((value) => {
      this.frm.patchValue({'accountManagerRate': 100});
      const ctrls = this.controls.slice();
      ctrls.reverse().forEach((element, index) => {
        const idx = ctrls.length - index - 1;
        if (value === element.value.agent) {
          this.onDeleteSalesRep(idx);
        }
      });
    });

    this.accountManagerSearchSub = this.frm.get('accountManagerSearch').valueChanges.subscribe((value) => {
      if (!this.onGetAgents()) {
        return;
      }
      
      let accountManagerSearch = value;
      if (!accountManagerSearch) {
        this.accountManagerFiltered.next(this.onGetAgents());
        return;
      } else {
        // accountManagerSearch = accountManagerSearch.toLowerCase();
        accountManagerSearch = '^'+accountManagerSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.accountManagerFiltered.next(
        // this.onGetAgents().filter(option => option.agentname.toLowerCase().startsWith(accountManagerSearch))
        this.onGetAgents().filter(option => {
          const regexp = new RegExp(accountManagerSearch,'ig');
          return regexp.test(option.agentname);
        })
      );
    });

    this.jobOrderSub = this.frm.get('jobOrder').valueChanges.subscribe((value) => {
      if (this.isEditJobOrder) {
        this.frm.setControl('salesReps', new FormArray([]));
        this.jobOrderFieldsInput = value;
        if (!!this.jobOrderFieldsInput) {
          this.frm.patchValue({
            'customerName': this.jobOrderFieldsInput.custid,
            'orderRef': this.jobOrderFieldsInput.orderref,
            'dt': formatDate(this.jobOrderFieldsInput.dt, 'yyyy-MM-dd', 'en-US'),
            'formTitle': this.jobOrderFieldsInput.formtitle,
            'quantity': this.f.s(+this.jobOrderFieldsInput.quantity, 0, 0, 0),
            'unitMeasure': this.jobOrderFieldsInput.unitmeasure,
            'materialCostTotal': this.f.s(+this.jobOrderFieldsInput.materialcost, 0),
            'processCostTotal': this.f.s(+this.jobOrderFieldsInput.processcost, 0),
            'otherCostTotal': this.f.s(+this.jobOrderFieldsInput.othercost, 0),
            'totalTransfer': this.f.s(+this.jobOrderFieldsInput.totaltransfer, 0),
            'sellingPriceTotal': this.f.s(+this.jobOrderFieldsInput.sellingprice, 0),
            'docStampsTotal': this.f.s(+this.jobOrderFieldsInput.docstamps, 0),
            'discountTotal': this.f.s(+this.jobOrderFieldsInput.discount, 0),
            'shippingHandlingTotal': this.f.s(+this.jobOrderFieldsInput.shippingHandling, 0),
            'dealerCommTotal': this.f.s((+this.jobOrderFieldsInput.callable === 0 ? 0 : +this.jobOrderFieldsInput.sellingprice + +this.jobOrderFieldsInput.docstamps - +this.jobOrderFieldsInput.discount + +this.jobOrderFieldsInput.shippingHandling - +this.jobOrderFieldsInput.callable), 0),
            'accountManager': this.jobOrderFieldsInput.accountmanager
          });
          const salesreps = this.jobOrderFieldsInput.salesreps.slice();
          for (let i=0;i<salesreps.length;++i) {
            this.onAddSalesRep();
            const index = this.controls.length - 1;
            this.salesReps.at(index).patchValue({
              'agent': salesreps[i].agent,
              'search': null,
              'rate': salesreps[i].rate
            });
            this.onChangeSalesRep();
          }
        }
      }
    });

    this.jobOrderSearchSub = this.frm.get('jobOrderSearch').valueChanges.subscribe((value) => {
      if (!this.redoJobOrdersData.slice()) {
        return;
      }
      
      let jobOrderSearch = value;
      if (!jobOrderSearch) {
        this.jobOrderFiltered.next(this.redoJobOrdersData.slice());
        return;
      } else {
        // jobOrderSearch = jobOrderSearch.toLowerCase();
        jobOrderSearch = '^'+jobOrderSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
      }
      
      this.jobOrderFiltered.next(
        // this.redoJobOrdersData.slice().filter(option => option.agentname.toLowerCase().startsWith(jobOrderSearch))
        this.redoJobOrdersData.slice().filter(option => {
          const regexp = new RegExp(jobOrderSearch,'ig');
          return regexp.test(option.joborderno);
        })
      );
    });
    
    this.customerNameFiltered.next(this.customersData.slice());
    this.accountManagerFiltered.next(this.onGetAgents());
    this.jobOrderFiltered.next(this.redoJobOrdersData.slice());

    this.onValueChanges();
  }

  onValueChanges() {
    this.frm.patchValue({'materialCostUnit': this.formulaService.getQuotient(this.frm.get('materialCostTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'processCostUnit': this.formulaService.getQuotient(this.frm.get('processCostTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'otherCostUnit': this.formulaService.getQuotient(this.frm.get('otherCostTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'totalCost': this.formulaService.getSum([this.frm.get('materialCostTotal').value, this.frm.get('processCostTotal').value, this.frm.get('otherCostTotal').value], 0)});
    this.frm.patchValue({'unitCost': this.formulaService.getQuotient(this.frm.get('totalCost').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'unitTransfer': this.formulaService.getQuotient(this.frm.get('totalTransfer').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'marginTotal': this.formulaService.getMargin([this.frm.get('sellingPriceTotal').value, this.frm.get('totalCost').value])});
    this.frm.patchValue({'marginUnit': this.frm.get('marginTotal').value});

    this.frm.patchValue({'netOfVatTotal': this.formulaService.getNetOfVat(this.frm.get('sellingPriceTotal').value)});
    this.frm.patchValue({'netOfVatUnit': this.formulaService.getQuotient(this.frm.get('netOfVatTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'vatTotal': this.formulaService.getVatAmount(this.frm.get('sellingPriceTotal').value)});
    this.frm.patchValue({'vatUnit': this.formulaService.getQuotient(this.frm.get('vatTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'sellingPriceUnit': this.formulaService.getQuotient(this.frm.get('sellingPriceTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'docStampsUnit': this.formulaService.getQuotient(this.frm.get('docStampsTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'discountUnit': this.formulaService.getQuotient(this.frm.get('discountTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'shippingHandlingUnit': this.formulaService.getQuotient(this.frm.get('shippingHandlingTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'invoiceAmountTotal': this.formulaService.getSum([this.frm.get('sellingPriceTotal').value, this.frm.get('docStampsTotal').value, "-"+(+this.f.n(this.frm.get('discountTotal').value)).toString(), this.frm.get('shippingHandlingTotal').value], 0)});
    this.frm.patchValue({'invoiceAmountUnit': this.formulaService.getQuotient(this.frm.get('invoiceAmountTotal').value, this.frm.get('quantity').value, 0)});
    this.frm.patchValue({'dealerCommUnit': this.formulaService.getQuotient(this.frm.get('dealerCommTotal').value, this.frm.get('quantity').value, 0)});
    let callableTotal = null;
    if (+this.f.n(this.frm.get('dealerCommTotal').value) > 0) {
      callableTotal = this.formulaService.getSum([this.frm.get('invoiceAmountTotal').value, "-"+(+this.f.n(this.frm.get('dealerCommTotal').value)).toString()], 0);
    } 
    this.frm.patchValue({'callableTotal': callableTotal});
    this.frm.patchValue({'callableUnit': this.formulaService.getQuotient(this.frm.get('callableTotal').value, this.frm.get('quantity').value, 0)});
  }

  onChangeSalesRep() {
    this.frm.patchValue({'accountManagerRate': this.formulaService.getSum(["100", "-"+(+this.calculateSalesRepsRate()).toString()], 1, 0, 2)});
  }

  async onSubmit() {
    const res = await this.jobOrdersService.addJobOrder(new JobOrder({
      jobOrder: (this.isEditJobOrder ? this.frm.get('jobOrder').value.joborderid : this.frm.get('jobOrder').value),
      isEditJobOrder: String(this.isEditJobOrder),
      orderRef: this.frm.get('orderRef').value,
      dt: this.frm.get('dt').value,
      customerName: this.frm.get('customerName').value,
      isNewCustomerName: String(this.isNewCustomerName),
      formTitle: this.frm.get('formTitle').value,
      quantity: this.frm.get('quantity').value,
      unitMeasure: this.frm.get('unitMeasure').value,
      materialCost: this.frm.get('materialCostTotal').value,
      processCost: this.frm.get('processCostTotal').value,
      otherCost: this.frm.get('otherCostTotal').value,
      totalTransfer: this.frm.get('totalTransfer').value,
      sellingPrice: this.frm.get('sellingPriceTotal').value,
      docStamps: this.frm.get('docStampsTotal').value,
      discount: this.frm.get('discountTotal').value,
      shippingHandling: this.frm.get('shippingHandlingTotal').value,
      callable: this.frm.get('callableTotal').value,
      accountManager: this.frm.get('accountManager').value,
      salesReps: this.controls.reduce((acc, cur) => acc.concat({agent: cur.value.agent, rate: +this.f.n(cur.value.rate)}), [])
    }));
    if (!!res.Success) {
      alert("Successfully submitted!");
    } else {
      alert("Submission has failed!\n\n" + res.Error);
    }
    this.onClear();
  }

  async onClear() {
    this.agentsData = <Array<any>>await this.jobOrdersService.getAgents();
    this.customersData = <Array<any>>await this.jobOrdersService.getCustomers();
    this.unitMeasuresData = <Array<any>>await this.jobOrdersService.getUnitMeasures();
    if (this.user.rolename.some(role => this.jobOrdersService.rolesInvoice.includes(role))) {
      this.redoJobOrdersData = <Array<any>>await this.jobOrdersService.getRedoJobOrders();
    }
    this.onReset();
  }

  onReset() {
    this.frm.setControl('salesReps', new FormArray([]));
    this.frm.reset();
  }

  addCommas(event, minIntegerDigits?: number, minFractionDigits?: number, maxFractionDigits?: number, i?: number) {
    let value = this.f.s(+this.f.n(event.target.value), minIntegerDigits, minFractionDigits, maxFractionDigits)
    event.target.value = value;
    if (!!i) {
      this.salesReps.at(i).patchValue({'rate': value})
    } else {
      this.frm.patchValue({[event.target.id]: value});
    }
  }

  removeCommas(event) {
    event.target.value = this.f.n(event.target.value);
  }

  onGetVat() {
    return this.formulaService.getVatRate();
  }

  onGetFormulaTransfer() {
    return this.formulaService.getFormulaTransfer();
  }

  onGetFormulaMargin() {
    return this.formulaService.getFormulaMargin();
  }
  
  // OPTION
  onGetAgents(selectedAgents=[]) {
    let agents: {agentid: number; agentname: string;}[] = this.agentsData.slice();
    return agents.filter(a => !selectedAgents.map(b=>b).includes(a.agentid));
  }

  // EXCLUDED selected
  onGetSelectedAgents(i: number) {
    let selectedAgents = [this.frm.get('accountManager').value];
    const ctrls = this.controls.slice();
    ctrls.forEach((element, index) => {
      if (!!element.value.agent && (index !== i)) {
        selectedAgents.push(element.value.agent);
      }
    });
    return selectedAgents;
  }

  // HANDLER Change salesRepName
  onSelectionChangeSalesRepName(event: any, i: number) {
    const ctrls = this.controls.slice();
    ctrls.reverse().forEach((element, index) => {
      const idx = ctrls.length - index - 1;
      if ((event.value === element.value.agent) && (idx !== i)) {
        this.onDeleteSalesRep(idx);
      }
    });
  }

  // HANDLER Click salesRepName
  onClickSalesRepName(event: any, i: number) {
    this.salesRepNameFiltered[i].next(this.onGetAgents(this.onGetSelectedAgents(i)));
  }

  // HANDLER salesRepNameSearch
  onKeyupSalesRepNameSearch(event: any, i: number) {
    if (!this.onGetAgents(this.onGetSelectedAgents(i))) {
      return;
    }
    
    let salesRepNameSearch = this.salesReps.at(i).get('search').value;
    if (!salesRepNameSearch) {
      this.salesRepNameFiltered[i].next(this.onGetAgents(this.onGetSelectedAgents(i)));
      return;
    } else {
      // salesRepNameSearch = salesRepNameSearch.toLowerCase();
      salesRepNameSearch = '^'+salesRepNameSearch.split(/(\b[^\s]+\b)/).reduce((acc, cur) => (cur.trim().length === 0 ? acc : acc.concat(cur.trim())), []).join('.*?')+'.*?';
    }
    
    this.salesRepNameFiltered[i].next(
      // this.onGetAgents(this.onGetSelectedAgents(i)).filter(option => option.agentname.toLowerCase().startsWith(salesRepNameSearch))
      this.onGetAgents(this.onGetSelectedAgents(i)).filter(option => {
        const regexp = new RegExp(salesRepNameSearch,'ig');
        return regexp.test(option.agentname);
      })
    );
  }

  // HANDLER salesRepsRate
  onChangeSalesRepRate(event: any, i: number) {
    this.onChangeSalesRep();
  }

  calculateSalesRepsRate(): number {
    let salesRepsRate = 0;
    const ctrls = this.controls.slice();
    ctrls.forEach((element) => {
      if (!!element.value.rate) {
        salesRepsRate += +this.f.n(element.value.rate);
      }
    });
    return +salesRepsRate;
  }

  onAddSalesRep() {
    (<FormArray>this.frm.get('salesReps')).push(
      new FormGroup({
        'agent': new FormControl(null, Validators.required),
        'search': new FormControl(null),
        'rate': new FormControl(null, Validators.required)
      })
    );
    this.salesRepNameFiltered.push(new ReplaySubject<any>(1));
    const index = this.salesRepNameFiltered.length - 1;
    this.salesRepNameFiltered[index].next(this.onGetAgents(this.onGetSelectedAgents(index)));
  }

  onDeleteSalesRep(index: number) {
    (<FormArray>this.frm.get('salesReps')).removeAt(index);
    this.salesRepNameFiltered.splice(index, 1);
    this.frm.patchValue({'accountManagerRate': this.formulaService.getSum(["100", "-"+(+this.calculateSalesRepsRate()).toString()], 1, 0, 2)});
  }

  onToggleCustomerNameControl(): boolean {
    this.frm.patchValue({'customerName': null});
    return this.isNewCustomerName = !this.isNewCustomerName;
  }

  onToggleJobOrderControl(): boolean {
    this.onReset();
    return this.isEditJobOrder = !this.isEditJobOrder;
  }
  
  get salesReps() {
    return this.frm.get('salesReps') as FormArray;
  }

  get controls() {
    return (<FormArray>this.frm.get('salesReps')).controls;
  }

  get onSetEnable(): boolean {
    return !((+this.calculateSalesRepsRate() < 100) && this.frm.controls.accountManager.valid && this.frm.controls.accountManagerRate.valid && this.frm.controls.salesReps.valid && (!!this.agentsData.slice() ? this.controls.length < (this.agentsData.slice().length - 1) : true))
  }
  
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.isAuthenticated && (!this.frm.untouched || this.controls.length)) {
      return confirm('Do you want to discard the changes?');
    }
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.accountManagerSub) { this.accountManagerSub.unsubscribe(); }
    if (this.quantitySub) { this.quantitySub.unsubscribe(); }
    if (this.materialCostTotalSub) { this.materialCostTotalSub.unsubscribe(); }
    if (this.processCostTotalSub) { this.processCostTotalSub.unsubscribe(); }
    if (this.otherCostTotalSub) { this.otherCostTotalSub.unsubscribe(); }
    if (this.totalTransferSub) { this.totalTransferSub.unsubscribe(); }
    if (this.sellingPriceTotalSub) { this.sellingPriceTotalSub.unsubscribe(); }
    if (this.docStampsTotalSub) { this.docStampsTotalSub.unsubscribe(); }
    if (this.discountTotalSub) { this.discountTotalSub.unsubscribe(); }
    if (this.shippingHandlingTotalSub) { this.shippingHandlingTotalSub.unsubscribe(); }
    if (this.dealerCommTotalSub) { this.dealerCommTotalSub.unsubscribe(); }
    if (this.customerNameSearchSub) { this.customerNameSearchSub.unsubscribe(); }
    if (this.accountManagerSearchSub) { this.accountManagerSearchSub.unsubscribe(); }
    if (this.jobOrderSub) { this.jobOrderSub.unsubscribe(); }
    if (this.jobOrderSearchSub) { this.jobOrderSearchSub.unsubscribe(); }
  }
}
