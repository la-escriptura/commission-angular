import { Injectable } from "@angular/core";
import { formatNumber } from "@angular/common";

@Injectable()
export class FormatService{

    n(s: string) {
        if (!!s) {
            return +(s.toString().split(',').join(''));
        } else {
            return '';
        }
    }

    // minIntegerDigits  - A number from 1 to 21 (default is 1)
    // minFractionDigits - A number from 0 to 20 (default is 3)
    // maxFractionDigits - A number from 0 to 20 (default is 3)
    s(n: number, minIntegerDigits: number = 1, minFractionDigits: number = 2, maxFractionDigits: number = 2, defaultValue: string = ''): string {
        if (!!n) {
            return formatNumber(+(+n).toFixed(maxFractionDigits), 'en-US', minIntegerDigits + '.' + minFractionDigits + '-' + maxFractionDigits);
        } else if (minIntegerDigits > 0) {
            return formatNumber(0, 'en-US', minIntegerDigits + '.' + minFractionDigits + '-' + maxFractionDigits);
        } else {
            return defaultValue;
        }
    }
      
    c(n: number, minFractionDigits: number = 2, defaultValue: string = '0.00'): string {
        const pad = ' ';
        const ret = Number(n).toLocaleString('en-US', {
            style: 'currency',
            currencySign: 'accounting',
            currencyDisplay: "code",
            currency: "PHP",
            minimumFractionDigits: minFractionDigits
        }).replace('PHP'+pad,'') + (n<0 ? '' : pad);

        if (!!n) {
            return ret;
        } else {
            return defaultValue + pad;
        }
    }  
}