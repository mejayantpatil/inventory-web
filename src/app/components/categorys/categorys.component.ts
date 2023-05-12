import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-categorys',
  templateUrl: './categorys.component.html',
  styleUrls: ['./categorys.component.scss']
})
export class CategorysComponent {
  private fileName: string = 'Categorys Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public category: any = {};
  public showNewCategoryForm: boolean = false;
  public categoryForm: FormGroup;
  public editCategoryFlag: boolean = false;
  constructor(private categorySerivce: CategoryService) {
    this.categoryForm = new FormGroup({
      categoryName: new FormControl('')
    })
  }
  ngOnInit(): void {
    this.getAllCategorys();
  }

  getAllCategorys() {
    this.categorySerivce.getCategorys().subscribe((res: any) => {
      this.data = res;
    });
  }

  initializeForm() {
    this.categoryForm = new FormGroup({
      categoryName: new FormControl('')
    })
  }
  newCategory() {
    this.editCategoryFlag = true
    this.showNewCategoryForm = true
  }

  editCategory() {
    this.editCategoryFlag = true;
    this.categoryForm = new FormGroup({
      categoryName: new FormControl(this.category.categoryName)
    })
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      this.categorySerivce.saveCategory(this.categoryForm.value).subscribe(res => {
        this.cancel();
        this.getAllCategorys();
      })
    }
  }

  cancel() {
    this.editCategoryFlag = false
    this.showNewCategoryForm = false;
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