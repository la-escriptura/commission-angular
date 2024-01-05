import { Injectable } from "@angular/core";
import { HyperFormula } from 'hyperformula';
import { ApiService } from "./api.service";
import { FormatService } from "./format.service";

@Injectable()
export class FormulaService {
    private withheld: number[] = new Array(3);
    private vat: number = null;
    private formulaTransfer: string = null;
    private formulaMargin: string = null;
    private options = {
        licenseKey: 'gpl-v3'
    };
  
    constructor(private f: FormatService, private apiService: ApiService) {}

    async setFormulas() {
        const formula = <Array<any>>await this.apiService.getApi('formula', 'all');
        formula.forEach( (element) => {
            switch (element.formulaname) {
                case "WITHHOLDINGTAX1":
                    this.withheld[0] = +element.formulaexpression;
                    break;
                case "WITHHOLDINGTAX2":
                    this.withheld[1] = +element.formulaexpression;
                    break;
                case "WITHHOLDINGTAX3":
                    this.withheld[2] = +element.formulaexpression;
                    break;
                case "VAT":
                    this.vat = +element.formulaexpression;
                    break;
                case "TRANSFERAMOUNT":
                    this.formulaTransfer = element.formulaexpression;
                    break;
                case "MARGININIT":
                    this.formulaMargin = element.formulaexpression;
                    break;
            }
        });
    }

    getSum(addend: string[], minIntegerDigits?: number, minFractionDigits?: number, maxFractionDigits?: number): string {
        // let x: number = 0;
        // addend.forEach(e => x += +this.f.n(e));
        return this.f.s(addend.reduce((acc, cur) => acc + +this.f.n(cur), 0), minIntegerDigits, minFractionDigits, maxFractionDigits);
    }

    getProduct(multiplicand: string, multiplier: string): string {
        return this.f.s(+this.f.n(multiplicand) * +this.f.n(multiplier), 0);
    }

    getQuotient(dividend: string, divisor: string, minIntegerDigits?: number, minFractionDigits?: number, maxFractionDigits?: number): string {
        return this.f.s(+this.f.n(dividend) / +this.f.n(divisor), minIntegerDigits, minFractionDigits, maxFractionDigits);
    }

    getWithheldRate(index: number): string {
        return this.f.s(this.withheld[index] * 100, 0, 0, 0)
    }

    getWithheldAmount(base: string, index: number): string {
        return this.f.s(+this.f.n(base) * this.withheld[index], 0);
    }

    getVatRate(): string {
        return this.f.s(this.vat * 100, 0, 0, 0)
    }

    getNetOfVat(sellingPriceTotal: string): string {
        return this.f.s(+this.f.n(sellingPriceTotal) / (1 + this.vat), 0);
    }

    getVatAmount(sellingPriceTotal: string): string {
        return this.f.s(+this.f.n(sellingPriceTotal) / (1 + this.vat) * this.vat, 0);
    }

    getFormulaTransfer(): string {
        return this.formulaTransfer;
    }

    getFormulaMargin(): string {
        return this.formulaMargin;
    }

    getTransfer(data: string[]): string {
        const cellMaping = {
            "TotalCost": "A1",
            "VatRate": this.vat
        }
        let formula = this.formulaTransfer;
        for (const key in cellMaping) {
            formula = formula.replaceAll(new RegExp(key, "ig"), cellMaping[key]);
        }
        const hfInstance = HyperFormula.buildFromArray([data.reduce((acc, cur) => acc.concat(+this.f.n(cur)), []).concat("= " + formula)], this.options);        
        return this.f.s(+hfInstance.getCellValue({sheet: 0, row: 0, col: data.length}), 0);
    }

    getMargin(data: string[]): string {
        const cellMaping = {
            "SellingPrice": "A1",
            "TotalCost": "B1",
            "VatRate": this.vat
        }
        let formula = this.formulaMargin;
        for (const key in cellMaping) {
            formula = formula.replaceAll(new RegExp(key, "ig"), cellMaping[key]);
        }
        const hfInstance = HyperFormula.buildFromArray([data.reduce((acc, cur) => acc.concat(+this.f.n(cur)), []).concat("= " + formula)], this.options);        
        return this.f.s(+hfInstance.getCellValue({sheet: 0, row: 0, col: data.length}), 0, 2, 4);
    }
}