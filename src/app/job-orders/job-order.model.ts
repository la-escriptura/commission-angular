import { SalesRep } from "./sales-rep.model";
import { FormatService } from "../shared/format.service";

export interface JobOrderFieldsInput {
    orderref: string;
    dt: string;
    custid: string;
    formtitle: string;
    quantity: string;
    unitmeasure: string;
    materialcost: string;
    processcost: string;
    othercost: string;
    totaltransfer: string;
    sellingprice: string;
    docstamps: string;
    discount: string;
    shippingHandling: string;
    callable: string;
    accountmanager: string;
    salesreps: SalesRep[];    
}

export interface JobOrderFieldsOutput {
    jobOrder: string;
    isEditJobOrder: string;
    orderRef: string;
    dt: string;
	customerName: string;
    isNewCustomerName: string;
    formTitle: string;
    quantity: string;
    unitMeasure: string;
    materialCost: string;
    processCost: string;
    otherCost: string;
    totalTransfer: string;
    sellingPrice: string;
    docStamps: string;
    discount: string;
    shippingHandling: string;
    callable: string;
    accountManager: string;
    salesReps: SalesRep[];
}

export class JobOrder {
    private f: FormatService = new FormatService();

    private _jobOrder: string;
    private _isEditJobOrder: boolean;
    private _orderRef: string;
    private _dt: string;
    private _customerName: string;
    private _isNewCustomerName: boolean;
    private _formTitle: string;
    private _quantity: number;
    private _unitMeasure: string;
    private _materialCost: number;
    private _processCost: number;
    private _otherCost: number;
    private _totalTransfer: number;
    private _sellingPrice: number;
    private _docStamps: number;
    private _discount: number;
    private _shippingHandling: number;
    private _callable: number;
    private _accountManager: string;
    private _salesReps: SalesRep[];

    constructor({
        jobOrder,
        isEditJobOrder,
        orderRef,
        dt,
        customerName,
        isNewCustomerName,
        formTitle,
        quantity,
        unitMeasure,
        materialCost,
        processCost,
        otherCost,
        totalTransfer,
        sellingPrice,
        docStamps,
        discount,
        shippingHandling,
        callable,
        accountManager,
        salesReps
    }: JobOrderFieldsOutput) {
        this._jobOrder = jobOrder;
        this._isEditJobOrder = JSON.parse(isEditJobOrder);
        this._orderRef = orderRef;
        this._dt = dt;
        this._customerName = customerName;
        this._isNewCustomerName = JSON.parse(isNewCustomerName);
        this._formTitle = formTitle;
        this._quantity = +this.f.n(quantity);
        this._unitMeasure = unitMeasure;
        this._materialCost = +this.f.n(materialCost);
        this._processCost = +this.f.n(processCost);
        this._otherCost = +this.f.n(otherCost);
        this._totalTransfer = +this.f.n(totalTransfer);
        this._sellingPrice = +this.f.n(sellingPrice);
        this._docStamps = +this.f.n(docStamps);
        this._discount = +this.f.n(discount);
        this._shippingHandling = +this.f.n(shippingHandling);
        this._callable = +this.f.n(callable);
        this._accountManager = accountManager;
        this._salesReps = salesReps;
    }

    get values() {return {
        'jobOrder': this._jobOrder,
        'isEditJobOrder': this._isEditJobOrder,
        'orderRef': this._orderRef,
        'dt': this._dt,
        'customerName': this._customerName,
        'isNewCustomerName': this._isNewCustomerName,
        'formTitle': this._formTitle,
        'quantity': this._quantity,
        'unitMeasure': this._unitMeasure,
        'materialCost': this._materialCost,
        'processCost': this._processCost,
        'otherCost': this._otherCost,
        'totalTransfer': this._totalTransfer,
        'sellingPrice': this._sellingPrice,
        'docStamps': this._docStamps,
        'discount': this._discount,
        'shippingHandling': this._shippingHandling,
        'callable': this._callable,
        'accountManager': this._accountManager,
        'salesReps': this._salesReps
    }}
}