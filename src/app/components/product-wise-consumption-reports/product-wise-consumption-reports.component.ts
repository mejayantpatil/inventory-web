import { Component } from '@angular/core';
import { SpareParts } from 'src/app/models/jobs';
import { CategoryService } from 'src/app/services/category.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { TransactionService } from 'src/app/services/transactions.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-product-wise-consumption-reports',
  templateUrl: './product-wise-consumption-reports.component.html',
  styleUrls: ['./product-wise-consumption-reports.component.scss']
})
export class ProductWiseConsumptionReportsComponent {
  private fileName: string = 'Products Wise Consumption Report ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public startDate: string = new Date(new Date().setDate(1)).toISOString().substring(0, 10);
  public endDate: string = new Date().toISOString().substring(0, 10);
  public categorys: any[] = []
  public categroysObj: any = {}
  public data: any[] = []
  public transactions: any[] = []
  public jobs: any[] = [];
  public jobsData: any[] = [];
  public vehicles: any[] = [];
  public stockPurchased: any = {}
  public stockPuchasedValues: any = {}
  public stockConsumed: any = {}
  public showTable: boolean = false;
  public totalQty = 0;
  public totalPurchasedQty = 0;
  public totalConsumedQty = 0;
  public totalPurchasedRate = 0;
  public totalSaleRate = 0;
  public totalCost = 0;
  public selectedVehicle: string = '';
  constructor(private categoryService: CategoryService,
    private transactionService: TransactionService,
    private jobService: JobService,
    private vehicleService: VehicleService,
    private productService: ProductService, private spinner: SpinnerService) {

  }
  ngOnInit(): void {
    this.getAllProducts();
    this.getAllCategories();
    this.getAllVehicles();
  }

  getAllCategories() {
    this.categoryService.getCategorys().subscribe((res: any) => {
      this.categorys = res;
      this.categorys.forEach(c => {
        this.categroysObj[c._id] = c.categoryName;
      });
    })
  }


  getAllVehicles() {
    this.vehicleService.getVehicles().subscribe((res: any) => {
      this.vehicles = res;
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
        this.totalSaleRate = this.totalSaleRate + parseFloat(d.saleRate);
      })
    });
  }

  formatData() {
    let netAmount = 0;
    this.jobsData = [];
    this.totalCost = 0;
    if (this.jobs.length > 0) {
      this.jobs.map((j: any) => {
        j.spareParts.map((s: SpareParts) => {
          netAmount = netAmount + parseFloat(s.netAmount.toString());
          console.log(j.netAmount, netAmount);
          this.jobsData.push({
            jobCardNo: j.jobCardNo, jobCardDate: j.jobCardDate, registrationNumber: j.registrationNumber,
            modelName: j.modelName, partNo: s.partNo, partName: s.partName, quantity: s.quantity, netAmount: s.netAmount
          })
        })
      });
      this.totalCost = parseFloat(netAmount.toFixed(2));
    } else {
      this.jobsData = [];
      this.totalCost = 0;
    }
  }

  all() {
    let netAmount = 0;
    this.jobsData = [];
    this.totalCost = 0;
    this.selectedVehicle = ''
    if (this.jobs.length > 0) {
      this.jobs.map((j: any) => {
        j.spareParts.map((s: SpareParts) => {
          netAmount = netAmount + parseFloat(s.netAmount.toString());
          console.log(j.netAmount, netAmount);
          this.jobsData.push({
            jobCardNo: j.jobCardNo, jobCardDate: j.jobCardDate, registrationNumber: j.registrationNumber,
            modelName: j.modelName, partNo: s.partNo, partName: s.partName, quantity: s.quantity, netAmount: s.netAmount
          })
        })
      });
      this.totalCost = parseFloat(netAmount.toFixed(2));
    } else {
      this.jobsData = [];
      this.totalCost = 0;
    }
  }

  busWise() {
    let netAmount = 0;
    this.jobsData = [];
    this.totalCost = 0;
    if (this.jobs.length > 0) {
      this.jobs.map((j: any) => {
        j.spareParts.map((s: SpareParts) => {
          if (j.registrationNumber.includes(this.selectedVehicle.split(' ')[0])) {
            netAmount = netAmount + parseFloat(s.netAmount.toString());
            console.log(j.netAmount, netAmount);
            this.jobsData.push({
              jobCardNo: j.jobCardNo, jobCardDate: j.jobCardDate, registrationNumber: j.registrationNumber,
              modelName: j.modelName, partNo: s.partNo, partName: s.partName, quantity: s.quantity, netAmount: s.netAmount
            })
          }

        })
      });
      this.totalCost = netAmount;
    } else {
      this.jobsData = [];
      this.totalCost = 0;
    }
  }

  getTransactions() {
    this.transactionService.getTransactionsByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.transactions = res;
      // this.formatData();
      res.map((t: any) => {
        t.data.map((i: any) => {
          this.stockPurchased[i.partNo] = parseInt(this.stockPurchased[i.partNo] ? this.stockPurchased[i.partNo] : '0') + parseInt(i.quantity);
          this.stockPuchasedValues[i.partNo] = i.newRate ? i.newRate : 0
          this.totalPurchasedQty = this.totalPurchasedQty + parseInt(i.quantity);
        })

      });
      Object.keys(this.stockPuchasedValues).map(p => {
        // this.totalPurchasedRate = this.totalPurchasedRate + this.stockPuchasedValues[p]
      })
    })
  }

  getJobs() {
    this.jobService.getJobByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.jobs = res;
      this.formatData()
      res.map((t: any) => {
        t.spareParts.map((i: any) => {
          this.stockConsumed[i.partNo] = (this.stockConsumed[i.partNo] ? this.stockConsumed[i.partNo] : 0) + i.quantity;
          this.totalConsumedQty = this.totalConsumedQty + i.quantity;
        })
      });
    })
  }

  search() {
    this.showTable = true;
    this.getTransactions();
    this.getJobs();
  }

  filterResults(categoryID: string) {
    if (categoryID) {
      this.spinner.showSpinner();
      this.productService.getProductsByCategory(categoryID).subscribe((res: any) => {
        this.spinner.hideSpinner();
        this.data = res;
      });
    } else {
      this.getAllProducts();
    }
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

