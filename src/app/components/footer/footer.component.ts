import { Component, OnInit } from '@angular/core';
import { address, companyName } from 'src/app/constants';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public companyName = companyName;
  public address = address
  constructor() { }

  ngOnInit(): void {
  }

}
