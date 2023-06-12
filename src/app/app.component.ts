import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Vishwayoddha Shetkari Multitrade';
  loginMenu = window.location.hash === '#/' || window.location.hash === '#/login';

  constructor(private router: Router) {
    this.router.events.subscribe(res => {
      this.loginMenu = window.location.hash === '#/' || window.location.hash === '#/login';
    });
  }
}
