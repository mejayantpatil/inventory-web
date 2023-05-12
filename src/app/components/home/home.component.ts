import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public data: any[];
  constructor(private router: Router, private userSerivce: UserService) {
    this.data = [];
   }

  ngOnInit(): void {
    this.userSerivce.getUsers().subscribe((res:any)=>{
      this.data = res;
    }); 
  }

  viewProfile(id: string) {
    this.router.navigate(['profile', id])
  }
  shortlist() {
    this.router.navigate(['shortlist'])
  }
  sendMessage() {
    this.router.navigate(['chat'])
  }
}
