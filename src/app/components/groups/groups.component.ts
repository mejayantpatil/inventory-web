import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { GroupService } from 'src/app/services/groups.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent {
  private fileName: string = 'Groups Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public group: any = {};
  public showNewGroupForm: boolean = false;
  public groupForm: FormGroup;
  public editGroupFlag: boolean = false;
  constructor(private groupSerivce: GroupService) {
    this.groupForm = new FormGroup({
      groupName: new FormControl('')
    })
  }
  ngOnInit(): void {
    this.getAllGroups();
  }

  getAllGroups() {
    this.groupSerivce.getGroups().subscribe((res: any) => {
      this.data = res;
    });
  }

  initializeForm() {
    this.groupForm = new FormGroup({
      groupName: new FormControl('')
    })
  }
  newGroup() {
    this.editGroupFlag = true
    this.showNewGroupForm = true
  }

  editGroup() {
    this.editGroupFlag = true;
    this.groupForm = new FormGroup({
      groupName: new FormControl(this.group.groupName)
    })
  }

  saveGroup() {
    if (this.groupForm.valid) {
      this.groupSerivce.saveGroup(this.groupForm.value).subscribe(res => {
        this.cancel();
        this.getAllGroups();
      })
    }
  }

  cancel() {
    this.editGroupFlag = false
    this.showNewGroupForm = false;
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