import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private data: any[];
    private baseUrl = serverBase + '/products';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}];
    }


    getProducts() {
        return this.http.get(this.baseUrl);
    }

    getProductsWithLowQuantity() {
        return this.http.get(this.baseUrl + '/lowQuantity');
    }

    getProductsByCategory(categoryID: string) {
        return this.http.get(this.baseUrl + '/category/' + categoryID);
    }

    getProduct(id: string) {
        //  return this.http.get(this.baseUrl+'/'+id); 
        return this.data.find(product => product.id === id);
    }

    saveProduct(product: any) {
        return this.http.post(this.baseUrl, product);
    }


    updateProduct(id: string, productData: Product) {
        // this.spinner.showSpinner();
        return this.http.put(this.baseUrl + '/' + id, productData);
        //     this.data.map((product, index) => {
        //         if (product.id === id) {
        //             this.data[index] = productData
        //         }
        //     });
        //     setTimeout(() => {
        //         this.spinner.hideSpinner();
        //     }, 1000);
    }

    deleteProduct(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }

    uploadFile(file: any) {

        const formData = new FormData();
        formData.append("file", file);
        // const upload$ = this.http.post("/upload", formData);
        return this.http.post(this.baseUrl + '/upload', formData);
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
