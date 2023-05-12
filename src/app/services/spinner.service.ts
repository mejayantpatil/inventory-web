import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  public showSpinnerFlag: boolean = false;
  constructor() { }
  showSpinner() {
    this.showSpinnerFlag = true;
  }
  hideSpinner() {
    this.showSpinnerFlag = false;
  }
}
