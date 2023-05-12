import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterPipe'
})
export class FilterPipe implements PipeTransform {

    transform(array: any[], searchWord: string): any {
        return array.filter(a => a.partNumber.toLowerCase().includes(searchWord.toLowerCase()) ||
            a.partName.toLowerCase().includes(searchWord.toLowerCase()));
    }

}
