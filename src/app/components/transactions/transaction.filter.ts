import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterInvoice'
})
export class FilterInvoice implements PipeTransform {

    transform(array: any[], searchWord: string): any {
        return array.filter(a => searchWord ? a.transactionNo === parseInt(searchWord) || a.supplierInvoiceNo.includes(searchWord) : a);
    }

}
