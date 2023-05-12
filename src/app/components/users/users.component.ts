import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  private fileName: string = 'Users Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public user: any = {};
  public showNewUserForm: boolean = false;
  public userForm: FormGroup;
  public editUserFlag: boolean = false;
  constructor(private userSerivce: UserService, private spinner: SpinnerService) {
    this.userForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      mobile: new FormControl(''),
      address: new FormControl('')
    })
  }
  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.spinner.showSpinner();
    this.userSerivce.getUsers().subscribe((res: any) => {
      this.spinner.hideSpinner();
      this.data = res;
    });
  }

  initializeForm() {
    this.userForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      mobile: new FormControl(''),
      address: new FormControl('')
    })
  }
  newUser() {
    this.editUserFlag = true
    this.showNewUserForm = true
  }

  editUser() {
    this.editUserFlag = true;
    this.userForm = new FormGroup({
      firstName: new FormControl(this.user.firstName),
      lastName: new FormControl(this.user.lastName),
      mobile: new FormControl(this.user.mobile),
      address: new FormControl(this.user.address),
      // country: new FormControl(this.user.country)
    })
  }

  saveUser() {
    if (this.userForm.valid) {
      this.userSerivce.saveUser(this.userForm.value).subscribe(res => {
        this.cancel();
        this.getAllUsers();
      })
    }
  }

  cancel() {
    this.editUserFlag = false
    this.showNewUserForm = false;
    this.initializeForm();
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
