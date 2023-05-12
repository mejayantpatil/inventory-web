import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Category } from 'src/app/models/category';
import { Product } from 'src/app/models/product';
import { CategoryService } from 'src/app/services/category.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { TransactionService } from 'src/app/services/transactions.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  private fileName: string = 'Products Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public product: any = {};
  public showNewProductForm: boolean = false;
  public productForm: FormGroup;
  public editProductFlag: boolean = false;
  public categorys: any[] = [];
  public categroysObj: any = {};
  public selectedDevice: string = '';
  public fileToUpload: File | null = null;
  public file: any;
  public files: any;
  public showFileUpload: boolean = false;
  public partNo: string = ''
  public partName: string = ''
  public showPopup = -1;
  public stockConsumed: any = {}
  public stockPurchased: any = {}
  public stockConsumedData: any = {}
  public stockPurchasedData: any = {}
  public stockPurchasedTotal: any = {};
  public stockConsumedTotal: any = {};
  public selectedRowIndex = -1;
  public testData: any = {};
  public transactions: any = []
  public jobsData: any = [];
  constructor(private productSerivce: ProductService, private categoryService: CategoryService,
    private transactionService: TransactionService,
    private jobService: JobService,
    private spinner: SpinnerService) {
    this.productForm = new FormGroup({
      partNumber: new FormControl(''),
      partName: new FormControl(''),
      saleRate: new FormControl(''),
      category: new FormControl(''),
      quantity: new FormControl(''),
      unit: new FormControl(''),
      storeLocation: new FormControl(''),
      ledgerPageNumber: new FormControl(''),
    })
  }
  ngOnInit(): void {
    this.getAllProducts();
    this.getAllCategories();
    this.getAllTransactions();
    this.getAllJobs();
  }

  getAllCategories() {
    this.categoryService.getCategorys().subscribe((res: any) => {
      this.categorys = res;
      this.categorys.forEach(c => {
        this.categroysObj[c._id] = c.categoryName;
      });
    })
  }

  getAllProducts() {
    this.spinner.showSpinner();
    this.productSerivce.getProducts().subscribe((res: any) => {
      this.spinner.hideSpinner();
      this.data = res;
    });
  }

  getAllTransactions() {
    this.transactionService.getTransactions().subscribe((res: any) => {
      this.transactions = res;
      res.map((t: any) => {
        t.data.map((i: any) => {
          // console.log(this.data[this.selectedRowIndex]);
          this.stockPurchased[i.partNo] = parseInt(this.stockPurchased[i.partNo] ? this.stockPurchased[i.partNo] : '0') + parseInt(i.quantity ? i.quantity : 0);
          // this.stockPuchasedValues[i.partNo] = i.newRate ? i.newRate : 0

          // this.testData[sele]

          // if (this.stockPurchasedData[i.partNo]) {
          //   t.quantity = parseInt(t.quantity ? t.quantity : '0') + parseInt(i.quantity ? i.quantity : '0');
          //   t.total = i.netAmount;
          //   // console.log('if', i.netAmount)
          //   t.partNo = i.partNo;
          //   this.stockPurchasedData[i.partNo].push(t);
          //   this.stockPurchasedTotal[i.partNo] = parseFloat(this.stockPurchasedTotal[i.partNo]) + parseFloat(i.netAmount ? i.netAmount : 0);
          // } else {
          //   t.quantity = i.quantity;
          //   t.total = i.netAmount;
          //   t.partNo = i.partNo;
          //   // console.log('else', i.netAmount)
          //   this.stockPurchasedTotal[i.partNo] = parseFloat(i.netAmount ? i.netAmount : 0)
          //   this.stockPurchasedData[i.partNo] = [t];
          // }
          // console.log(this.stockPurchasedTotal, i.partNo)
          // this.stockPurchasedTotal[i.partNo] = this.stockPurchasedTotal + parseFloat(t.netAmount);
        })
      });
      // this.stockPurchasedTotal = parseFloat(this.stockPurchasedTotal.toFixed(2));
    })
  }

  getAllJobs() {
    this.jobService.getJobs().subscribe((res: any) => {
      this.jobsData = res;
      res.map((t: any) => {
        t.cardData.map((c: any) => {
          c?.spareParts && c?.spareParts.map((i: any) => {
            // if (t.status === 'Complete') {
            this.stockConsumed[i.partNo] = parseInt(this.stockConsumed[i.partNo] ? this.stockConsumed[i.partNo] : 0) + parseInt(i.quantity ? i.quantity : 0);
            // this.totalConsumedQty = this.totalConsumedQty + i.quantity;
            // }
            // console.log(c)
            // if (this.stockConsumedData[i.partNo]) {
            //   c.jobCardNo = t.jobCardNo;
            //   c.partNo = i.partNo
            //   c.quantity = i.quantity;//this.stockConsumed[i.partNo]//parseInt(c.quantity ? c.quantity : '0') + parseInt(i.quantity ? i.quantity : '0');
            //   // console.log(c.quantity)
            //   this.stockConsumedData[i.partNo].push(c);
            //   this.stockConsumedTotal[i.partNo] = this.stockConsumedTotal[i.partNo] + parseFloat(i.netAmount);
            // } else {
            //   // console.log(i.partNo)
            //   c.partNo = i.partNo
            //   c.quantity = i.quantity //this.stockConsumed[i.partNo];
            //   c.jobCardNo = t.jobCardNo;
            //   this.stockConsumedData[i.partNo] = [c];
            //   this.stockConsumedTotal[i.partNo] = parseFloat(i.netAmount);
            // }
            // this.stockConsumedTotal = this.stockConsumedTotal + parseFloat(c.netAmount);
          })
        })

      });

      // this.stockConsumedTotal = parseFloat(this.stockConsumedTotal.toFixed(2));
    })
  }

  initializeForm() {
    this.productForm = new FormGroup({
      partNumber: new FormControl(''),
      partName: new FormControl(''),
      saleRate: new FormControl(''),
      category: new FormControl(''),
      quantity: new FormControl(''),
      unit: new FormControl(''),
      storeLocation: new FormControl(''),
      ledgerPageNumber: new FormControl(''),
    })
  }
  newProduct() {
    this.editProductFlag = true
    this.showNewProductForm = true
  }

  editProduct(product: Product) {
    this.editProductFlag = true
    this.showNewProductForm = true
    this.productForm = new FormGroup({
      partNumber: new FormControl(product.partNumber),
      partName: new FormControl(product.partName),
      saleRate: new FormControl(product.saleRate),
      category: new FormControl(product.category),
      quantity: new FormControl(product.quantity),
      unit: new FormControl(product.unit),
      storeLocation: new FormControl(product.storeLocation),
      ledgerPageNumber: new FormControl(product.ledgerPageNumber),
      _id: new FormControl(product._id)
    })
  }

  saveProduct(product: Product) {
    if (this.productForm.valid && product._id) {
      // update
      this.productSerivce.updateProduct(product._id, this.productForm.value).subscribe(res => {
        this.cancel();
        this.getAllProducts();
      })
    } else if (this.productForm.valid) {
      // save 
      this.productSerivce.saveProduct(this.productForm.value).subscribe(res => {
        this.cancel();
        this.getAllProducts();
      })
    }
  }

  cancel() {
    this.editProductFlag = false
    this.showNewProductForm = false;
    this.initializeForm();
  }

  filterResults(categoryID: string) {
    if (categoryID) {
      this.spinner.showSpinner();
      this.productSerivce.getProductsByCategory(categoryID).subscribe((res: any) => {
        this.spinner.hideSpinner();
        this.data = res;
      });
    } else {
      this.getAllProducts();
    }
  }

  deleteProduct(id: string) {
    this.spinner.showSpinner();
    this.productSerivce.deleteProduct(id).subscribe(() => {
      this.spinner.hideSpinner(); this.getAllProducts();
    });
  }

  importData() {
    this.showFileUpload = true
  }


  onFileChange(event: any) {
    this.files = event.target.files;
    console.log(event);
  }

  uploadFile() {
    console.log(this.files[0])
    this.spinner.showSpinner();
    this.productSerivce.uploadFile(this.files[0]).subscribe(res => {
      this.getAllProducts();
      this.showFileUpload = false;
      this.files = [];
      this.spinner.hideSpinner();
    })
  }

  toggleDetails(i: number, product: Product) {
    this.selectedRowIndex = this.selectedRowIndex !== i ? i : -1
    // console.log(this.data[this.selectedRowIndex].partNumber);
    this.getPartNoTransactions(product.partNumber);
    this.getJobsData(product.partNumber)
  }

  getPartNoTransactions(partNumber: any) {
    this.stockPurchasedData = {}
    this.stockPurchasedTotal = {}
    this.transactions.map((t: any) => {

      t.data.map((i: any) => {

        if (i.partNo === partNumber) {
          console.log(i)

          if (this.stockPurchasedData[partNumber]) {
            t.quantity = parseInt(t.quantity ? t.quantity : '0') + parseInt(i.quantity ? i.quantity : '0');
            t.total = i.netAmount;
            t.partNo = i.partNo;
            this.stockPurchasedData[partNumber].push(t);
            this.stockPurchasedTotal[partNumber] = parseFloat(this.stockPurchasedTotal[i.partNo]) + parseFloat(i.netAmount ? i.netAmount : 0);
          } else {
            t.quantity = i.quantity;
            t.total = i.netAmount;
            t.partNo = i.partNo;
            // console.log('else', i.netAmount)
            this.stockPurchasedTotal[partNumber] = parseFloat(i.netAmount ? i.netAmount : 0)
            this.stockPurchasedData[partNumber] = [t];
          }
        }
        // console.log(this.stockPurchasedTotal, i.partNo)
        // this.stockPurchasedTotal[i.partNo] = this.stockPurchasedTotal + parseFloat(t.netAmount);
      })
    });
    // console.log('->', this.stockPurchasedData[partNumber])
  }

  getJobsData(partNumber: any) {
    this.stockConsumedData = {}
    this.stockConsumedTotal = {}
    this.jobsData.map((t: any) => {

      t.cardData.map((c: any) => {
        c?.spareParts && c?.spareParts.map((i: any) => {

          if (i.partNo === partNumber) {
            c.total = i.netAmount;
            if (this.stockConsumedData[i.partNo]) {
              c.jobCardNo = t.jobCardNo;
              c.partNo = i.partNo
              c.quantity = i.quantity;//this.stockConsumed[i.partNo]//parseInt(c.quantity ? c.quantity : '0') + parseInt(i.quantity ? i.quantity : '0');
              // console.log(c.quantity)
              this.stockConsumedData[i.partNo].push(c);
              this.stockConsumedTotal[i.partNo] = parseFloat(this.stockConsumedTotal[i.partNo]) + parseFloat(i.netAmount ? i.netAmount : '0');
            } else {
              // console.log(i.partNo)
              c.partNo = i.partNo
              c.quantity = i.quantity //this.stockConsumed[i.partNo];
              c.jobCardNo = t.jobCardNo;
              this.stockConsumedData[i.partNo] = [c];
              this.stockConsumedTotal[i.partNo] = parseFloat(i.netAmount ? i.netAmount : '0');
            }
          }
          // this.stockConsumedTotal = this.stockConsumedTotal + parseFloat(c.netAmount);
        })
      })

    });

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