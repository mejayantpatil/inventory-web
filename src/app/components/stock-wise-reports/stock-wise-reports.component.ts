import { Component } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { TransactionService } from 'src/app/services/transactions.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-stock-wise-reports',
  templateUrl: './stock-wise-reports.component.html',
  styleUrls: ['./stock-wise-reports.component.scss']
})
export class StockWiseReportsComponent {
  private fileName: string = 'Stock Wise Report ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public startDate: string = new Date(new Date().setDate(1)).toISOString().substring(0, 10);
  public endDate: string = new Date().toISOString().substring(0, 10);
  public categorys: any[] = []
  public categroysObj: any = {}
  public data: any[] = []
  public transactions: any[] = []
  public stockPurchased: any = {}
  public stockPuchasedValues: any = {}
  public stockConsumed: any = {}
  public showTable: boolean = false;
  public totalQty = 0;
  public totalPurchasedQty = 0;
  public totalConsumedQty = 0;
  public totalPurchasedRate = 0;
  public totalSaleRate = 0;
  public openingQuantity = 0;
  public closingQuanity = 0;
  public totalItemSaleRate = 0;
  public newData: any[] = [];
  constructor(private categoryService: CategoryService,
    private transactionService: TransactionService,
    private jobService: JobService,
    private productService: ProductService, private spinner: SpinnerService) {

  }
  ngOnInit(): void {
    this.getAllProducts();
    this.getAllCategories();
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
    this.productService.getProducts().subscribe((res: any) => {
      this.spinner.hideSpinner();
      this.data = res;
      this.data.map(d => {
        this.totalQty = this.totalQty + d.quantity;
        this.totalPurchasedRate = this.totalPurchasedRate + (d.newRate ? d.newRate : 0)
        // this.totalSaleRate = this.totalSaleRate + parseFloat(d.saleRate);
      })
    });
  }

  getTransactions() {
    this.transactionService.getTransactionsByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.stockPurchased = {};
      res.map((t: any) => {
        t.data.map((i: any) => {
          this.stockPurchased[i.partNo] = parseInt(this.stockPurchased[i.partNo] ? this.stockPurchased[i.partNo] : '0') + parseInt(i.quantity);
          this.stockPuchasedValues[i.partNo] = i.newRate ? i.newRate : 0
          // this.totalPurchasedQty = this.totalPurchasedQty + parseInt(i.quantity);
        })
      });

      // Object.keys(this.stockPuchasedValues).map(p => {
      //   // this.totalPurchasedRate = this.totalPurchasedRate + this.stockPuchasedValues[p]
      // })
      this.getJobs();
    })
  }

  getJobs() {
    this.jobService.getJobByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.stockConsumed = {}
      res.map((t: any) => {
        t.spareParts.map((i: any) => {
          // if (t.status === 'Complete') {
          this.stockConsumed[i.partNo] = (this.stockConsumed[i.partNo] ? this.stockConsumed[i.partNo] : 0) + i.quantity;
          this.totalConsumedQty = this.totalConsumedQty + i.quantity;
          // }
        })
      });
      this.formatData();
    })
  }

  search() {
    this.showTable = true;
    this.getTransactions();
    // this.getJobs();
  }

  filterResults(categoryID: string) {
    if (categoryID) {
      this.spinner.showSpinner();
      this.productService.getProductsByCategory(categoryID).subscribe((res: any) => {
        this.spinner.hideSpinner();
        this.data = res;
        this.formatData()
      });
    } else {
      this.getAllProducts();
    }
  }

  formatData() {
    // let arr = = [];
    this.totalQty = 0;
    this.totalSaleRate = 0;
    this.openingQuantity = 0;
    this.closingQuanity = 0;
    this.totalPurchasedQty = 0;
    this.totalConsumedQty = 0;
    this.totalItemSaleRate = 0;
    this.newData = [];
    this.data.map(d => {
      const quantity = d.quantity ? d.quantity : 0;
      const purchasedQty = this.stockPurchased[d.partNumber] ? this.stockPurchased[d.partNumber] : 0;
      const consumedQty = this.stockConsumed[d.partNumber] ? this.stockConsumed[d.partNumber] : 0;
      this.totalQty = this.totalQty + (d.quantity ? d.quantity : 0)
      const totalSaleRate = (d.quantity ? d.quantity : 0) * d.saleRate;
      this.totalItemSaleRate = this.totalItemSaleRate + d.saleRate;
      this.totalSaleRate = this.totalSaleRate + (totalSaleRate ? totalSaleRate : 0)
      const opening = quantity;//(quantity > purchasedQty) ? quantity - purchasedQty : purchasedQty - quantity;
      const closingQty = (opening + purchasedQty) - consumedQty;
      this.openingQuantity = this.openingQuantity + opening;
      this.closingQuanity = this.closingQuanity + closingQty;
      this.totalPurchasedQty = this.totalPurchasedQty + purchasedQty;
      this.totalConsumedQty = this.totalConsumedQty + consumedQty;
      this.newData.push({
        partNumber: d.partNumber,
        partName: d.partName,
        opening: opening ? opening : 0,
        purchasedQty: purchasedQty,
        consumedQty, closingQty,
        saleRate: (d.saleRate ? d.saleRate : 0).toFixed(2),
        closingRate: (d.quantity * d.saleRate).toFixed(2)
      })
      // console.log(d.partNumber, d.partName, opening ? opening : 0, purchasedQty, consumedQty, closingQty, d.saleRate, d.quantity * d.saleRate)
    })
    // console.log('-->', this.openingQuantity, this.totalPurchasedQty, this.totalConsumedQty, this.closingQuanity, this.totalItemSaleRate, this.totalSaleRate)
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

