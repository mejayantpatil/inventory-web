import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { companyName } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = companyName;
  loginMenu = window.location.hash === '#/' || window.location.hash === '#/login';
  public className: string = ''
  constructor(private router: Router) {
    this.router.events.subscribe(res => {
      this.loginMenu = window.location.hash === '#/' || window.location.hash === '#/login';
      const date = new Date().getDay();
      this.className = this.loginMenu ? (date % 2 === 0 ? 'bus-3' : 'bus-4') : ''
    });

  }
}
