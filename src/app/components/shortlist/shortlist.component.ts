import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shortlist',
  templateUrl: './shortlist.component.html',
  styleUrls: ['./shortlist.component.scss']
})
export class ShortlistComponent implements OnInit {

  public data: any[];
  constructor(private router: Router) {
    this.data = [];
   }

  ngOnInit(): void {
    this.data = [
      {
        id: '1',
        firstName: 'Om',
        lastName: 'Patil',
        age: '30',
        occupation: 'Software Engineer',
        location: 'Pune' 
      },
      {
        id: '2',
        firstName: 'Om',
        lastName: 'Patil',
        age: '30',
        occupation: 'Software Engineer',
        location: 'Pune' 
      },  
    ]
  }

}
