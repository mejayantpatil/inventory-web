import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SupplyOrder } from '../models/supplyOrder';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class SupplyOrderService {

    private data: any[];
    private baseUrl = serverBase + '/supplyOrders';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}];
    }


    getSupplyOrders() {
        return this.http.get(this.baseUrl);
    }

    getSupplyOrdersByCategory(categoryID: string) {
        return this.http.get(this.baseUrl + '/category/' + categoryID);
    }

    getSupplyOrder(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(supplyOrder => supplyOrder.id === id);
    }

    saveSupplyOrder(supplyOrder: any) {
        return this.http.post(this.baseUrl, supplyOrder);
    }


    updateSupplyOrder(id: string, supplyOrderData: SupplyOrder) {
        // this.spinner.showSpinner();
        return this.http.put(this.baseUrl + '/' + id, supplyOrderData);
        //     this.data.map((supplyOrder, index) => {
        //         if (supplyOrder.id === id) {
        //             this.data[index] = supplyOrderData
        //         }
        //     });
        //     setTimeout(() => {
        //         this.spinner.hideSpinner();
        //     }, 1000);
    }

    deleteSupplyOrder(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }

    uploadFile(file: any) {

        const formData = new FormData();
        formData.append("file", file);
        // const upload$ = this.http.post("/upload", formData);
        return this.http.post(this.baseUrl + '/upload', formData);
    }

    getSupplyOrdersByDate(startDate: string, endDate: string) {
        return this.http.post(this.baseUrl + '/getByDate', { startDate, endDate });
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
