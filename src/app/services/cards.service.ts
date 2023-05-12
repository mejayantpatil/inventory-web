

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Card } from '../models/card';
import { SpinnerService } from './spinner.service';
import { serverBase } from 'src/main';

@Injectable({
    providedIn: 'root'
})
export class CardService {

    private data: any[];
    private baseUrl = serverBase + '/cards';
    constructor(private spinner: SpinnerService, private http: HttpClient) {
        this.data = [{}]
    }


    getCards() {
        return this.http.get(this.baseUrl);
    }

    getCard(id: string) {
        return this.http.get(this.baseUrl + '/' + id);
        // return this.data.find(card => card.id === id);
    }

    saveCard(card: any) {
        return this.http.post(this.baseUrl, card);
    }

    updateCard(id: string, cardData: Card) {
        return this.http.put(this.baseUrl + '/' + id, cardData);
    }

    deleteCard(id: string) {
        return this.http.delete(this.baseUrl + '/' + id);
    }
    backUp() {
        return this.http.post(this.baseUrl + '/backup', {});
    }
}
