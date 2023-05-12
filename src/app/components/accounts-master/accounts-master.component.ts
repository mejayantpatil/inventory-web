import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Account } from 'src/app/models/account';
import { AccountService } from 'src/app/services/accounts.service';
import { GroupService } from 'src/app/services/groups.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-accounts-master',
  templateUrl: './accounts-master.component.html',
  styleUrls: ['./accounts-master.component.scss']
})
export class AccountsMasterComponent {
  private fileName: string = 'Accounts Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public account: any = {};
  public showNewAccountForm: boolean = false;
  public accountForm: FormGroup;
  public editAccountFlag: boolean = false;
  public groups: any[] = [];
  public groupsObj: any = {};
  constructor(private accountSerivce: AccountService, private groupService: GroupService, private spinner: SpinnerService) {
    this.accountForm = new FormGroup({
      accountName: new FormControl(''),
      groupName: new FormControl(''),
      address: new FormControl(''),
      phone: new FormControl('')
    })
  }
  ngOnInit(): void {
    this.getAllAccounts();
    this.getAllGroups();
  }

  getAllGroups() {
    this.groupService.getGroups().subscribe((res: any) => {
      this.groups = res;
      this.groups.forEach(g => {
        this.groupsObj[g._id] = g.groupName;
      });
    })
  }

  getAllAccounts() {
    this.spinner.showSpinner();
    this.accountSerivce.getAccounts().subscribe((res: any) => {
      this.spinner.hideSpinner();
      this.data = res;
    });
  }

  initializeForm() {
    this.accountForm = new FormGroup({
      accountName: new FormControl(''),
      groupName: new FormControl(''),
      address: new FormControl(''),
      phone: new FormControl('')
    })
  }
  newAccount() {
    this.editAccountFlag = true
    this.showNewAccountForm = true
  }

  editAccount(account: Account) {
    this.editAccountFlag = true
    this.showNewAccountForm = true
    this.accountForm = new FormGroup({
      accountName: new FormControl(account.accountName),
      groupName: new FormControl(account.groupName),
      address: new FormControl(account.address),
      phone: new FormControl(account.phone),
      _id: new FormControl(account._id)
      // country: new FormControl(this.account.country)
    })
  }

  saveAccount(account: Account) {
    if (this.accountForm.valid && account._id) {
      // update
      this.accountSerivce.updateAccount(account._id, this.accountForm.value).subscribe(res => {
        this.cancel();
        this.getAllAccounts();
      })
    } else if (this.accountForm.valid) {
      // save 
      this.accountSerivce.saveAccount(this.accountForm.value).subscribe(res => {
        this.cancel();
        this.getAllAccounts();
      })
    }
  }

  cancel() {
    this.editAccountFlag = false
    this.showNewAccountForm = false;
    this.initializeForm();
  }

  filterAccounts(groupId: string) {
    if (groupId) {
      this.spinner.showSpinner();
      this.accountSerivce.getAccountsByGroup(groupId).subscribe((res: any) => {
        this.spinner.hideSpinner();
        this.data = res;
      });
    } else {
      this.getAllAccounts();
    }
  }

  deleteAccount(id: string) {
    this.accountSerivce.deleteAccount(id).subscribe(() => {
      this.getAllAccounts();
    })
  }

  exportToExcel(): void {
    /* pass here the table id */
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);

  }
}