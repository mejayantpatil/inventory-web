import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent {

  public activeMenu: string = ''
  constructor(private router: Router) {
    this.router.events.subscribe(res => {
      this.activeMenu = window.location.pathname.split('/')[1]
    })
  }

}

