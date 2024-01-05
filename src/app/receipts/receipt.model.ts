export interface InvoiceFieldsInput {
	accountid: string;
	invoiceno: string;
	dateinvoice: string;
	joborderno: string;
	qtyinvoice: string;
	qtyjoborder: string;
	materialcost: string;
	processcost: string;
	othercost: string;
	sellingprice: string;
	docstamps: string;
	rebate: string;
	retention: string;
	penalty: string;
	govshare: string;
	withheld0: string;
	withheld1: string;
	withheld2: string;
}

export interface ReceiptFieldsInput {
    dateor: string;
    custname: string;
    invoices: InvoiceFieldsInput[];
}

export interface InvoiceFieldsOutput {
	invoice: string;
	rebate: number;
	retention: number;
	penalty: number;
	govshare: number;
	withheld0: number;
	withheld1: number;
	withheld2: number;
}

export interface ReceiptFieldsOutput {
    OR: string;
	isEditReceipt: string;
    dt: string;
    invoices: InvoiceFieldsOutput[];
}

export class Receipt {
    private _or: string;
    private _isEditReceipt: boolean;
	private _dt: string;
    private _invoices: InvoiceFieldsOutput[];

    constructor({
        OR,
        isEditReceipt,
        dt,
        invoices
    }: ReceiptFieldsOutput) {
        this._or = OR;
        this._isEditReceipt = JSON.parse(isEditReceipt);
        this._dt = dt;
        this._invoices = invoices;
    }

    get values() {return {
        'OR': this._or,
		'isEditReceipt': this._isEditReceipt,
		'dt': this._dt,
        'invoices': this._invoices
    }}
}