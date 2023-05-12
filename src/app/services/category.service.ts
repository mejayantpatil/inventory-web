

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private data: any[];
    private baseUrl = serverBase + '/category';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}]
    }


    getCategorys() {
        return this.http.get(this.baseUrl);
    }

    getCategory(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(category => category.id === id);
    }

    saveCategory(category: any) {
        return this.http.post(this.baseUrl, category);
    }


    updateCategory(id: string, categoryData: Category) {

    }

    deleteCategory(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
