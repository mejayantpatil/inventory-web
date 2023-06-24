import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public username: string = '';
  public password: string = '';
  public error: string = ''
  public form = {
    username: '', password: ''
  };
  constructor(private router: Router) { }

  ngOnInit(): void {
    if (sessionStorage.getItem("SeesionUser")) {
      this.router.navigate(['dashboard']);
    }
  }

  login() {
    this.error = '';
    if (this.form.username === 'Admin' && this.form.password === 'Admin') {
      sessionStorage.setItem('SeesionUser', this.form.username)
      this.router.navigate(['dashboard']);
    } else {
      this.error = 'Please enter valid username and password.'
    }
  }
}
