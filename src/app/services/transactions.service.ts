import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../models/transactions';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    private data: any[];
    private baseUrl = serverBase + '/transactions';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}];
    }


    getTransactions() {
        return this.http.get(this.baseUrl);
    }

    getTransactionsByCategory(categoryID: string) {
        return this.http.get(this.baseUrl + '/category/' + categoryID);
    }

    getTransaction(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(transaction => transaction.id === id);
    }

    saveTransaction(transaction: any) {
        return this.http.post(this.baseUrl, transaction);
    }


    updateTransaction(id: string, transactionData: Transaction) {
        // this.spinner.showSpinner();
        return this.http.put(this.baseUrl + '/' + id, transactionData);
        //     this.data.map((transaction, index) => {
        //         if (transaction.id === id) {
        //             this.data[index] = transactionData
        //         }
        //     });
        //     setTimeout(() => {
        //         this.spinner.hideSpinner();
        //     }, 1000);
    }

    deleteTransaction(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }

    uploadFile(file: any) {

        const formData = new FormData();
        formData.append("file", file);
        // const upload$ = this.http.post("/upload", formData);
        return this.http.post(this.baseUrl + '/upload', formData);
    }

    getTransactionsByDate(startDate: string, endDate: string) {
        return this.http.post(this.baseUrl + '/getByDate', { startDate, endDate });
    }

    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
