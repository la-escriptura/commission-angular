import { FormatService } from "../shared/format.service";

export interface InvoiceFieldsInput {
    joborderno: string;
    dt: string;
	custname: string;
    formtitle: string;
    deliveryreceipt: string;
    qtyremaining: string;
    qtyjoborder: string;
    qtyinvoice: string;
    unitmeasure: string;
    sellingprice: string;
    docstamps: string;
}

export interface InvoiceFieldsOutput {
    invoice: string;
    isEditInvoice: string;
    jobOrderNo: string;
    dt: string;
    qtyinvoice: string;
    deliveryReceipt: string;
}

export class Invoice {
    private f: FormatService = new FormatService();

    private _invoice: string;
    private _isEditInvoice: boolean;
    private _jobOrderNo: string;
    private _dt: string;
    private _qtyinvoice: number;
    private _deliveryReceipt: string;

    constructor({
        invoice,
        isEditInvoice,
        jobOrderNo,
        dt,
        qtyinvoice,
        deliveryReceipt
    }: InvoiceFieldsOutput) {
        this._invoice = invoice;
        this._isEditInvoice = JSON.parse(isEditInvoice);
        this._jobOrderNo = jobOrderNo;
        this._dt = dt;
        this._qtyinvoice = +this.f.n(qtyinvoice);
        this._deliveryReceipt = deliveryReceipt;
    }

    get values() {return {
        'invoice': this._invoice,
        'isEditInvoice': this._isEditInvoice,
        'jobOrderNo': this._jobOrderNo,
        'dt': this._dt,
        'qtyinvoice': this._qtyinvoice,
        'deliveryReceipt': this._deliveryReceipt
    }}
}