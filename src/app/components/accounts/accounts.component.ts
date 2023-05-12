import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Account } from 'src/app/models/account';
import { AccountService } from 'src/app/services/accounts.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import * as XLSX from 'xlsx';
import { GroupService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent {

}