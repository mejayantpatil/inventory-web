import { Component, ViewChild } from '@angular/core';
import { Account } from 'src/app/models/account';
import { AccountService } from 'src/app/services/accounts.service';
import { GroupService } from 'src/app/services/groups.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { TransactionService } from 'src/app/services/transactions.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-purchase-reports',
  templateUrl: './purchase-reports.component.html',
  styleUrls: ['./purchase-reports.component.scss']
})
export class PurchaseReportsComponent {
  private fileName: string = 'Purchase-Report-' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public jobsData: any[] = [];
  public transactions: any[] = [];
  public transactionsData: any[] = [];
  public startDate: string = new Date(new Date().setDate(1)).toISOString().substring(0, 10);
  public endDate: string = new Date().toISOString().substring(0, 10);
  public showTable: boolean = false;
  public products: any[] = [];
  public selectedRowIndex = -1;
  public totalCost = 0;
  public totalQuantity = 0;
  public stockConsumed: any = {}
  public stockPurchased: any = {}
  public openingStock: any = {}
  public accounts: any = [];
  public suppliersData = [];
  public providersData = [];
  public supplierName: string = '';
  public providerName: string = '';
  public supplierGroupID = '';
  public providerGroupID = '';
  @ViewChild('providers') providersAuto: any
  @ViewChild('suppliers') suppliersAuto: any


  constructor(private jobService: JobService, private accountSerivce: AccountService,
    private groupService: GroupService, private productService: ProductService, private transactionService: TransactionService) {

  }

  ngOnInit() {
    this.getProducts();
    this.getAllJobs();
    // this.getAllAccounts();
    this.getGRoups();
  }

  getGRoups() {
    this.groupService.getGroups().subscribe((res: any) => {
      // this.groups = res;
      res.map((g: any) => {
        if (g.groupName.toLowerCase() === 'supplier') {
          this.supplierGroupID = g._id;
        }
        if (g.groupName.toLowerCase().includes('service provider')) {
          this.providerGroupID = g._id;
        }
      })
      this.getAllAccounts();
    })
  }

  getAllAccounts() {
    // this.spinner.showSpinner();
    this.accountSerivce.getAccounts().subscribe((res: any) => {
      // this.spinner.hideSpinner();
      this.accounts = res;
      this.suppliersData = this.accounts.filter((a: Account) => a.groupName === this.supplierGroupID);
      this.providersData = this.accounts.filter((a: Account) => a.groupName === this.providerGroupID);
    });
  }

  setSupplier(e: any) {
    this.supplierName = e ? e.accountName : ''
    this.providersAuto.query = ''
    // this.providersAuto.close()
    this.formatData();
  }

  setProvider(e: any) {
    this.supplierName = e ? e.accountName : ''
    this.suppliersAuto.query = ''
    // this.suppliersAuto.close()
    this.formatData();
  }

  getProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = res;
      res.map((p: any) => {
        this.openingStock[p.partNumber] = p.quantity;
      })
      // this.getAllTransactions();
    })
  }
  getAllTransactions() {
    this.showTable = true;
    this.totalCost = 0;
    this.totalQuantity = 0;
    this.transactionService.getTransactionsByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.transactions = res;
      this.formatData();
    });
  }

  formatData() {
    this.transactionsData = [];
    this.stockPurchased = {};
    this.totalCost = 0;
    this.totalQuantity = 0;
    this.transactions.map((t: any) => {
      if (this.supplierName) {
        let product: any = {}
        let quantity = 0;

        if (this.supplierName === t.supplierName) {
          t.data.map((p: any) => {
            product = this.products.find(pr => pr.partNumber === p.partNo)
            this.stockPurchased[p.partNo] = parseInt(this.stockPurchased[p.partNo] ? this.stockPurchased[p.partNo] : '0') + parseInt(p.quantity ? p.quantity : 0);
            quantity = quantity + parseInt(p.quantity)
          })
          this.transactionsData.push({
            transactionNo: t.transactionNo, date: t.date, supplierName: t.supplierName,
            netAmount: t.netAmount, quantity: quantity, data: t.data
          })
          this.totalCost = this.totalCost + t.netAmount
          this.totalQuantity = this.totalQuantity + (quantity ? quantity : 0)
        }
      } else {
        let product: any = {}
        let quantity = 0;
        t.data.map((p: any) => {
          product = this.products.find(pr => pr.partNumber === p.partNo)
          this.stockPurchased[p.partNo] = parseInt(this.stockPurchased[p.partNo] ? this.stockPurchased[p.partNo] : '0') + parseInt(p.quantity ? p.quantity : 0);
          quantity = quantity + parseInt(p.quantity)
        })
        this.transactionsData.push({
          transactionNo: t.transactionNo, date: t.date, supplierName: t.supplierName,
          netAmount: t.netAmount, quantity: quantity, data: t.data
        })
        this.totalCost = this.totalCost + t.netAmount
        this.totalQuantity = this.totalQuantity + (quantity ? quantity : 0)

      }

    });
    console.log(this.transactionsData)
  }

  getAllJobs() {
    this.jobService.getJobs().subscribe((res: any) => {
      res.map((t: any) => {
        t.cardData.map((c: any) => {
          c?.spareParts && c?.spareParts.map((i: any) => {
            // if (t.status === 'Complete') {
            this.stockConsumed[i.partNo] = parseInt(this.stockConsumed[i.partNo] ? this.stockConsumed[i.partNo] : 0) + parseInt(i.quantity ? i.quantity : 0);
            // this.totalConsumedQty = this.totalConsumedQty + i.quantity;
            // }
          })
        })

      });
    })
  }

  toggleDetails(i: number) {
    this.selectedRowIndex = this.selectedRowIndex !== i ? i : -1
  }

  search() {
    this.getAllTransactions();
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
