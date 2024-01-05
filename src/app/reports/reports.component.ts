import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable, Subscription } from 'rxjs';
import { EChartsOption } from 'echarts';
import html2canvas from "html2canvas";
import LinearGradient from 'zrender/lib/graphic/LinearGradient';
import { ProgressSpinnerDialogComponent } from '../shared/progress-spinner/progress-spinner-dialog.component';
import { AuthService } from '../auth/auth.service';
import { ReportsService } from './reports.service';
import { PdfService } from './pdf.service';
import { FormatService } from '../shared/format.service';
import { CanComponentDeactivate } from '../shared/can-deactivate.guard';
import { UtilityService } from '../shared/utility.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  private options = {
      licenseKey: 'gpl-v3'
  };
  public frm: FormGroup;
	private isAuthenticated:boolean = false;
  private userSub: Subscription;
  private currentUser: string = null;
  private pdfDone: boolean = false;
  public observable = new Observable(this.myObservable.bind(this));
  private intervalIsDone: any;

  constructor(private reportsService: ReportsService, private authService: AuthService, private f: FormatService, private pdf: PdfService, private dialog: MatDialog, private util: UtilityService) {}

  ngOnInit() {
    this.frm = new FormGroup({
      'salesReport': new FormControl(null, Validators.required),
      'commCollect': new FormControl(null, Validators.required),
      'corpComm': new FormControl(null, Validators.required),
      'salesRepComm': new FormControl(null, Validators.required)
    });

    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        this.currentUser = user.first_name;
      }
    });
  }
  
  myObservable(observer) {
    this.intervalIsDone = setInterval(() => {
      if (this.pdf.done || this.pdfDone) {
        observer.next("done");
        observer.complete();
        if (this.intervalIsDone) {
          clearInterval(this.intervalIsDone);
        }
        this.intervalIsDone = null;
      }
    }, 100);
  }

  showProgressSpinnerUntilExecuted(observable: Observable<Object>) {
    this.pdfDone = false;
    this.pdf.done = false;
    const dialogRef: MatDialogRef<ProgressSpinnerDialogComponent> = this.dialog.open(ProgressSpinnerDialogComponent, {
      panelClass: 'transparent',
      disableClose: true
    });
    dialogRef.componentInstance.message = "Generating...";
    const subscription = observable.subscribe((response: any) => {
      subscription.unsubscribe();
      console.log(response);
      dialogRef.close();
    },(error) => {
      subscription.unsubscribe();
      dialogRef.close();
    });
  }

  async genSalesReport() {
    this.showProgressSpinnerUntilExecuted(this.observable);
    const inputDate: string = this.frm.get('salesReport').value;
    const dateFormat = "YYYY-MM";
    if (!this.util.isDateValid(inputDate, dateFormat)) {
      this.pdfDone = true;
      alert("Date format is not valid ("+dateFormat+"): " + inputDate);
      return;      
    }
    const salesMonth = <Array<any>>await this.reportsService.getSalesMonth('?truncmonth='+formatDate(new Date(inputDate), 'yyyy-MM-01', 'en-US'));
    const reportDate = formatDate(new Date(inputDate), 'MMM yyyy', 'en-US');
    const title = 'Sales for ' + reportDate;
    if (salesMonth.length === 0) {
      this.pdfDone = true;
      alert("No data in the report " + title);
      return;
    }
    const content = [];
    let table = [];
    table.push(Object.entries(salesMonth[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
    let sumMaterial = 0;
    let sumProcess = 0;
    let sumOthers = 0;
    let sumTotal = 0;
    let sumDocStamps = 0;
    let sumTransfer = 0;
    let sumInvoiceAmount = 0;
    for (let i=0,j=1;i<salesMonth.length;i++,j++) {
      sumMaterial += +salesMonth[i]["Material"];
      sumProcess += +salesMonth[i]["Process"];
      sumOthers += +salesMonth[i]["Others"];
      sumTotal += +salesMonth[i]["Total"];
      sumDocStamps += +salesMonth[i]["Doc. Stamps"];
      sumTransfer += +salesMonth[i]["Transfer"];
      sumInvoiceAmount += +salesMonth[i]["Invoice Amount"];
      const row = [];
      row.push({alignment: 'right', text: (j).toString()+'.)'});
      row.push({alignment: 'left', text: salesMonth[i]["SR"]});
      row.push({alignment: 'left', text: salesMonth[i]["JO"]});
      row.push({alignment: 'left', text: formatDate(salesMonth[i]["Date"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: salesMonth[i]["Ord Ref"]});
      row.push({alignment: 'left', text: salesMonth[i]["Customer"]});
      row.push({alignment: 'left', text: salesMonth[i]["Form"]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Quantity"], 0, '-')});
      row.push({alignment: 'left', text: salesMonth[i]["Unit"]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Material"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Process"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Others"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Total"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Doc. Stamps"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Transfer"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Invoice Amount"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesMonth[i]["Margin"], 2, '-')});
      table.push(row);
      if ((i+1)>=salesMonth.length) {
        if (content.length > 0) {content.push({text: '', pageBreak: 'before'});}
        table.push([null,null,null,null,null,null,null,null,null, // blank columns
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumMaterial), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumProcess), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumOthers), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumTotal), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumDocStamps), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumTransfer), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumInvoiceAmount), decoration: 'underline', decorationStyle: 'double'},
          null]); // blank columns
        content.push({margin: [0, 0, 0, 18], fontSize: 11, alignment: 'center', lineHeight: 1.25, text: title});
        content.push({columns: [{ width: '*', text: '' },{width: 'auto', fontSize: 8, layout: 'lightHorizontalLines',table: {headerRows: 1, body: table}},{ width: '*', text: '' }]});
        table = [];
        table.push(Object.entries(salesMonth[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
      }
    }
    this.pdf.generatePdf(title, this.currentUser, content);
  }


  async genSOA() {
    this.showProgressSpinnerUntilExecuted(this.observable);
    const soa = <Array<any>>await this.reportsService.getSOA();
    const serverTimestamp = await this.util.getServerTimestamp();
    const reportDate = formatDate(new Date(serverTimestamp), 'MMM dd, yyyy', 'en-US');
    const title = 'Statement of Account';
    if (soa.length === 0) {
      this.pdfDone = true;
      alert("No data in the report " + title);
      return;
    }
    const content = [];
    let table = [];
    table.push(Object.entries(soa[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
    let sumAmount = 0;
    for (let i=0,j=1;i<soa.length;i++,j++) {
      sumAmount += +soa[i]["Amount"];
      const row = [];
      row.push({alignment: 'right', text: (j).toString()+'.)'});
      row.push({alignment: 'left', text: soa[i]["Invoices To"]});
      row.push({alignment: 'left', text: soa[i]["Description"]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+soa[i]["Quantity"], 0, '-')});
      row.push({alignment: 'left', text: soa[i]["Unit"]});
      row.push({alignment: 'left', text: soa[i]["Ord Ref"]});
      row.push({alignment: 'left', text: formatDate(soa[i]["Inv. Date"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: soa[i]["Inv. No."]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+soa[i]["Amount"], 2, '-')});
      table.push(row);
      if (((i+1)>=soa.length) || (soa[i]["Invoices To"] != soa[i+1]["Invoices To"])) {
        if (content.length > 0) {content.push({text: '', pageBreak: 'before'});}
        table.push([{alignment: 'right', colSpan: 7, text: 'Total Due:\t₱'},
          null,null,null,null,null,null,null, // blank columns
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumAmount), decoration: 'underline', decorationStyle: 'double'}]);
        content.push({margin: [0, 0, 0, 18], fontSize: 11, alignment: 'center', lineHeight: 1.25, text: title+'\nDue from '+soa[i]["Invoices To"]+'\nAs of '+reportDate});
        content.push({columns: [{ width: '*', text: '' },{width: 'auto', fontSize: 9, layout: 'lightHorizontalLines',table: {headerRows: 1, body: table}},{ width: '*', text: '' }]});
        table = [];
        table.push(Object.entries(soa[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
        sumAmount = 0;
        j=0;
      }
    }
    this.pdf.generatePdf(title, this.currentUser, content);
  }


  async genCommCollect() {
    this.showProgressSpinnerUntilExecuted(this.observable);
    const inputDate: string = this.frm.get('commCollect').value;
    const dateFormat = "YYYY-MM";
    if (!this.util.isDateValid(inputDate, dateFormat)) {
      this.pdfDone = true;
      alert("Date format is not valid ("+dateFormat+"): " + inputDate);
      return;      
    }
    const commCollect = <Array<any>>await this.reportsService.getCommCollect('?truncmonth='+formatDate(new Date(inputDate), 'yyyy-MM-01', 'en-US'));
    const reportDate = formatDate(new Date(inputDate), 'MMM yyyy', 'en-US');
    const title = 'Commission Collection for the month of ' + reportDate;
    if (commCollect.length === 0) {
      this.pdfDone = true;
      alert("No data in the report " + title);
      return;
    }
    const content = [];
    let table = [];
    table.push(Object.entries(commCollect[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
    let sumTCost = 0;
    let sumDStamps = 0;
    let sumTransfer = 0;
    let sumVat = 0;
    let sumAmountOfInvoice = 0;
    let sumDeductions = 0;
    let sumAmountReceived = 0;
    let sumComBasis = 0;
    for (let i=0,j=1;i<commCollect.length;i++,j++) {
      sumTCost += +commCollect[i]["T/Cost"];
      sumDStamps += +commCollect[i]["D/Stamps"];
      sumTransfer += +commCollect[i]["Transfer"];
      sumVat += +commCollect[i]["VAT"];
      sumAmountOfInvoice += +commCollect[i]["Amount of Invoice"];
      sumDeductions += +commCollect[i]["Deductions"];
      sumAmountReceived += +commCollect[i]["Amount Received"];
      sumComBasis += +commCollect[i]["Com/Basis"];
      const row = [];
      row.push({alignment: 'right', text: (j).toString()+'.)'});
      row.push({alignment: 'left', text: commCollect[i]["SR"]});
      row.push({alignment: 'left', text: commCollect[i]["JO No."]});
      row.push({alignment: 'left', text: commCollect[i]["Inv. No."]});
      row.push({alignment: 'left', text: formatDate(commCollect[i]["Date of Invoice"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: commCollect[i]["OR No."]});
      row.push({alignment: 'left', text: formatDate(commCollect[i]["Date of O.R."], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: commCollect[i]["Customer"]});
      row.push({alignment: 'left', text: commCollect[i]["Form"]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["T/Cost"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["D/Stamps"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["Transfer"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["VAT"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["Amount of Invoice"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["Deductions"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["Amount Received"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["Com/Basis"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+commCollect[i]["Margin"], 2, '-')});
      table.push(row);
      if ((i+1)>=commCollect.length) {
        if (content.length > 0) {content.push({text: '', pageBreak: 'before'});}
        table.push([null,null,null,null,null,null,null,null,null, // blank columns
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumTCost), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumDStamps), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumTransfer), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumVat), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumAmountOfInvoice), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumDeductions), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumAmountReceived), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumComBasis), decoration: 'underline', decorationStyle: 'double'},
          null]); // blank columns
        content.push({margin: [0, 0, 0, 18], fontSize: 11, alignment: 'center', lineHeight: 1.25, text: title});
        content.push({columns: [{ width: '*', text: '' },{width: 'auto', fontSize: 9, layout: 'lightHorizontalLines',table: {headerRows: 1, body: table}},{ width: '*', text: '' }]});
        table = [];
        table.push(Object.entries(commCollect[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
      }
    }
    this.pdf.generatePdf(title, this.currentUser, content);
  }


  async genCorpComm() {
    this.showProgressSpinnerUntilExecuted(this.observable);
    const inputDate: string = this.frm.get('corpComm').value;
    const dateFormat = "YYYY-MM";
    if (!this.util.isDateValid(inputDate, dateFormat)) {
      this.pdfDone = true;
      alert("Date format is not valid ("+dateFormat+"): " + inputDate);
      return;      
    }
    const corpComm = <Array<any>>await this.reportsService.getCorpComm('?truncmonth='+formatDate(new Date(inputDate), 'yyyy-MM-01', 'en-US'));
    const reportDate = formatDate(new Date(inputDate), 'MMM yyyy', 'en-US');
    const title = 'Corporate Commission for ' + reportDate;
    if (corpComm.length === 0) {
      this.pdfDone = true;
      alert("No data in the report " + title);
      return;
    }
    const content = [];
    let table = [];
    table.push(Object.entries(corpComm[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
    let sumDS = 0;
    let sumTCost = 0;
    let sumTransfer = 0;
    let sumInvoiceAmount = 0;
    let sumAmountReceived = 0;
    let sumCommBasis = 0;
    let sumComm = 0;
    let sumRqq = 0;
    let sumRask = 0;
    let sumRmt = 0;
    for (let i=0,j=1;i<corpComm.length;i++,j++) {
      sumDS += +corpComm[i]["D/S"];
      sumTCost += +corpComm[i]["T/Cost"];
      sumTransfer += +corpComm[i]["Transfer"];
      sumInvoiceAmount += +corpComm[i]["Invoice Amount"];
      sumAmountReceived += +corpComm[i]["Amount Received"];
      sumCommBasis += +corpComm[i]["Comm.Basis"];
      sumComm += +corpComm[i]["Comm"];
      sumRqq += +corpComm[i]["RQQ"];
      sumRask += +corpComm[i]["RASK"];
      sumRmt += +corpComm[i]["RMT"];
      const row = [];
      row.push({alignment: 'right', text: (j).toString()+'.)'});
      row.push({alignment: 'left', text: corpComm[i]["SR"]});
      row.push({alignment: 'left', text: corpComm[i]["JO No."]});
      row.push({alignment: 'left', text: corpComm[i]["Invoice No."]});
      row.push({alignment: 'left', text: formatDate(corpComm[i]["Invoice Date"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: corpComm[i]["OR No."]});
      row.push({alignment: 'left', text: formatDate(corpComm[i]["OR Date"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: corpComm[i]["Client"]});
      row.push({alignment: 'left', text: corpComm[i]["Form"]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Quantity"], 0, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["D/S"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["T/Cost"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Transfer"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Invoice Amount"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Amount Received"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Comm.Basis"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Comm"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["RQQ"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["RASK"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["RMT"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+corpComm[i]["Margin"], 2, '-')});
      table.push(row);
      if ((i+1)>=corpComm.length) {
        if (content.length > 0) {content.push({text: '', pageBreak: 'before'});}
        table.push([null,null,null,null,null,null,null,null,null,null, // blank columns
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumDS), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumTCost), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumTransfer), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumInvoiceAmount), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumAmountReceived), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumCommBasis), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumComm), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumRqq), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumRask), decoration: 'underline', decorationStyle: 'double'},
          {alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumRmt), decoration: 'underline', decorationStyle: 'double'},
          null]); // blank columns
        content.push({margin: [0, 0, 0, 18], fontSize: 11, alignment: 'center', lineHeight: 1.25, text: title});
        content.push({columns: [{ width: '*', text: '' },{width: 'auto', fontSize: 7, layout: 'lightHorizontalLines',table: {headerRows: 1, body: table}},{ width: '*', text: '' }]});
        table = [];
        table.push(Object.entries(corpComm[0]).slice().reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
      }
    }
    this.pdf.generatePdf(title, this.currentUser, content);
  }

  async genSalesRepComm() {
    this.showProgressSpinnerUntilExecuted(this.observable);
    const inputDate: string = this.frm.get('salesRepComm').value;
    const dateFormat = "YYYY-MM";
    if (!this.util.isDateValid(inputDate, dateFormat)) {
      this.pdfDone = true;
      alert("Date format is not valid ("+dateFormat+"): " + inputDate);
      return;      
    }
    const salesRepComm = <Array<any>>await this.reportsService.getSalesRepComm('?truncmonth='+formatDate(new Date(inputDate), 'yyyy-MM-01', 'en-US'));
    const reportDate = formatDate(new Date(inputDate), 'MMM yyyy', 'en-US');
    const title = 'Sales Representative Commission for ' + reportDate;
    if (salesRepComm.length === 0) {
      this.pdfDone = true;
      alert("No data in the report " + title);
      return;
    }
    const content = [];
    let table = [];
    table.push(Object.entries(salesRepComm[0]).slice(1).reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
    let SR = '';
    let sumComBasis = 0;
    let sumComm = 0;
    for (let i=0,j=1;i<salesRepComm.length;i++,j++) {
      SR = salesRepComm[i]["SR"];
      sumComBasis += +salesRepComm[i]["Com/Basis"];
      sumComm += +salesRepComm[i]["Comm"];
      const row = [];
      row.push({alignment: 'right', text: (j).toString()+'.)'});
      row.push({alignment: 'left', text: salesRepComm[i]["Jo No."]});
      row.push({alignment: 'left', text: salesRepComm[i]["Inv. No."]});
      row.push({alignment: 'left', text: formatDate(salesRepComm[i]["Date"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: salesRepComm[i]["OR No."]});
      row.push({alignment: 'left', text: formatDate(salesRepComm[i]["Date Paid"], 'MM/dd/yyyy', 'en-US')});
      row.push({alignment: 'left', text: salesRepComm[i]["Customer"]});
      row.push({alignment: 'left', text: salesRepComm[i]["Form"]});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesRepComm[i]["Quantity"], 0, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesRepComm[i]["Doc.Stamps"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesRepComm[i]["Selling"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesRepComm[i]["Com/Basis"], 2, '-')});
      row.push({alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(+salesRepComm[i]["Comm"], 2, '-')});
      table.push(row);
      if (((i+1)>=salesRepComm.length) || (salesRepComm[i]["SR"] != salesRepComm[i+1]["SR"])) {
        if (content.length > 0) {content.push({text: '', pageBreak: 'before'});}
        table.push([null,null,null,null,null,null,null,null,null,null,null, // blank columns
          {fontSize: 10, bold: true, alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumComBasis), decoration: 'underline', decorationStyle: 'double'},
          {fontSize: 10, bold: true, alignment: 'right', preserveTrailingSpaces: true, text: this.f.c(sumComm), decoration: 'underline', decorationStyle: 'double'}]);
        content.push({margin: [0, 0, 0, 18], fontSize: 11, alignment: 'center', lineHeight: 1.25, text: title});
        const masterTable = [];
        masterTable.push([{fontSize: 10, bold: true, alignment: 'left', lineHeight: 1.25, text: ['Commission Statement for ',{text: SR, decoration: 'underline'},' for the month of '+reportDate]}]);
        masterTable.push([{width: 'auto', fontSize: 9, layout: 'lightHorizontalLines',table: {headerRows: 1, body: table}}]);
        content.push({columns: [{ width: '*', text: '' },{width: 'auto', layout: 'noBorders',table: {headerRows: 1, body: masterTable}},{ width: '*', text: '' }]});
        table = [];
        table.push(Object.entries(salesRepComm[0]).slice(1).reduce((record, [key, value]) => record.concat({bold: true,alignment: 'left',text: key}), [{bold: true,alignment: 'left',text: ''}]));
        sumComBasis = 0;
        sumComm = 0;
        // j=0;
      }
    }
    this.pdf.generatePdf(title, this.currentUser, content);
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
















  
  // if (!!imgURL) {
  //   content.push(
  //     {
  //       width: 1116,
  //       height: 288,
  //       image: imgURL
  //     }
  //   );
  // }




  // private salesYear = [];
  // private data1 = [];
  // private data2 = [];

  // ngOnInit() {
  //   this.route.data.subscribe((data: Data) => {
  //       this.salesYear = data['reportSalesYear'];
  //   });

  //   this.salesYear.forEach((element) => {
  //     this.data1.push(element["month"]);
  //     this.data2.push(element["sales"]);
  //   });
  // }


  // chartOption: EChartsOption = {
  //     xAxis: {
  //         type: 'category',
  //         boundaryGap: false,
  //         data: this.data1
  //     },
  //     yAxis: {
  //         type: 'value'
  //     },
  //     tooltip: {
  //         trigger: 'item',
  //         showDelay: 0,
  //         transitionDuration: 0.2,
  //         formatter: (params) => {return `<b>${params['name']}</b> : ${this.f.s(+params['value'], 0, 0, 0)}`;}
  //     },
  //     series: [
  //         {
  //             data: this.data2,
  //             type: 'line',
  //             emphasis: {
  //                 itemStyle: {
  //                   color: new LinearGradient(0, 0, 0, 1, [
  //                     { offset: 0, color: '#ff0000' },
  //                     { offset: 0.7, color: '#ff0000' },
  //                     { offset: 1, color: '#ff0000' },
  //                   ]),
  //                   borderWidth: 10
  //                 }
  //               },
  //         }
  //     ]
  // }


  // async onChartClick(event) {
  //   formatDate(new Date(event.name.replace('\'','20')), 'yyyy-MM-dd', 'en-US')
  //   html2canvas(document.getElementById('exportthis')).then(canvas => {
  //     this.pdf.generatePdf('Nova\nBuisness\nSystems', rows, canvas.toDataURL('image/png'));
  //   });
  // }

  
