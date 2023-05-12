import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterJob'
})
export class FilterJob implements PipeTransform {

    transform(array: any[], searchWord: string): any {
        return array.filter(a => searchWord ? a.jobCardNo.includes(searchWord) ||
            a.registrationNumber.toLowerCase().includes(searchWord) : a);
    }

}
