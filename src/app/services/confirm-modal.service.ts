import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConfirmModalService {
    public visible: boolean = false;
    public id: string = ''
    constructor() { }
    show(id: string) {
        this.id = id;
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }
}
