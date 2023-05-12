import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkOrder } from '../models/workOrder';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class WorkOrderService {

    private data: any[];
    private baseUrl = serverBase + '/workOrders';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}];
    }


    getWorkOrders() {
        return this.http.get(this.baseUrl);
    }

    getWorkOrdersByCategory(categoryID: string) {
        return this.http.get(this.baseUrl + '/category/' + categoryID);
    }

    getWorkOrder(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(workOrder => workOrder.id === id);
    }

    saveWorkOrder(workOrder: any) {
        return this.http.post(this.baseUrl, workOrder);
    }


    updateWorkOrder(id: string, workOrderData: WorkOrder) {
        // this.spinner.showSpinner();
        return this.http.put(this.baseUrl + '/' + id, workOrderData);
        //     this.data.map((workOrder, index) => {
        //         if (workOrder.id === id) {
        //             this.data[index] = workOrderData
        //         }
        //     });
        //     setTimeout(() => {
        //         this.spinner.hideSpinner();
        //     }, 1000);
    }

    deleteWorkOrder(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }

    uploadFile(file: any) {

        const formData = new FormData();
        formData.append("file", file);
        // const upload$ = this.http.post("/upload", formData);
        return this.http.post(this.baseUrl + '/upload', formData);
    }

    getWorkOrdersByDate(startDate: string, endDate: string) {
        return this.http.post(this.baseUrl + '/getByDate', { startDate, endDate });
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
