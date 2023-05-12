import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account } from '../models/account';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    private data: any[];
    private baseUrl = serverBase + '/accounts';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}];
    }


    getAccounts() {
        return this.http.get(this.baseUrl);
    }

    getAccountsByGroup(groupId: string) {
        return this.http.get(this.baseUrl + '/group/' + groupId);
    }

    getAccount(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(account => account.id === id);
    }

    saveAccount(account: any) {
        return this.http.post(this.baseUrl, account);
    }


    updateAccount(id: string, accountData: Account) {
        return this.http.put(this.baseUrl + '/' + id, accountData);
    }

    deleteAccount(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
