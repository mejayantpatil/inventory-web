import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor() { }
  gettoken() {
    return !!sessionStorage.getItem("SeesionUser");
  }
}
