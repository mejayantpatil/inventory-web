import { Component, ViewChild } from '@angular/core';
import { Job, SpareParts } from 'src/app/models/jobs';
import { CategoryService } from 'src/app/services/category.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { TransactionService } from 'src/app/services/transactions.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { companyName } from 'src/app/constants';


@Component({
  selector: 'app-vehicle-reports',
  templateUrl: './vehicle-reports.component.html',
  styleUrls: ['./vehicle-reports.component.scss']
})
export class VehicleReportsComponent {
  private fileName: string = 'Vehicle Wise Consumption Report ' + new Date().toISOString().substring(0, 10) + '.xlsx';
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
  public originalData = [];
  public Jobs = [];
  public jobCardNo = ''
  constructor(private categoryService: CategoryService,
    private transactionService: TransactionService,
    private jobService: JobService,
    private vehicleService: VehicleService,
    private productService: ProductService, private spinner: SpinnerService) {

  }
  ngOnInit(): void {
    // this.getAllProducts();
    // this.getAllCategories();
    this.getAllVehicles();

  }


  getAllJobs() {
    this.spinner.showSpinner();
    this.totalCost = 0;
    this.selectedVehicle = ''
    this.jobService.getJobByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.showTable = true;
      this.spinner.hideSpinner();
      const data: any = res;
      this.originalData = res;
      res.forEach((i: any) => {
        this.totalCost = this.totalCost + parseFloat(i.netAmount)
        //   let arr = {}
        //   i.cardData.map((c: any, index: number) => {
        //     if (index > 0) return;
        //     arr = { _id: i._id, jobCardNo: i.jobCardNo, ...c };
        //     data.push(arr);
        //   })
      })
      data.sort((a: Job, b: Job) => {
        const aa = parseInt(a.jobCardNo)
        const bb = parseInt(b.jobCardNo)
        return bb - aa;
      });
      this.jobs = data;
      this.data = data;
      // this.data = data.reverse();
    });
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
          // console.log(j.netAmount, netAmount);
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
    this.data = [];
    if (this.jobs.length > 0) {
      this.jobs.map((j: any) => {
        this.data.push(j)
        netAmount = netAmount + parseFloat(j.netAmount.toString());
        // j.spareParts.map((s: SpareParts) => {
        //   netAmount = netAmount + parseFloat(s.netAmount.toString());
        //   console.log(j.netAmount, netAmount);
        //   this.jobsData.push({
        //     jobCardNo: j.jobCardNo, jobCardDate: j.jobCardDate, registrationNumber: j.registrationNumber,
        //     modelName: j.modelName, partNo: s.partNo, partName: s.partName, quantity: s.quantity, netAmount: s.netAmount
        //   })
        // })
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
    this.data = [];
    if (this.jobs.length > 0) {
      this.jobs.map((j: any) => {
        // j.spareParts.map((s: SpareParts) => {
        if (j.registrationNumber.includes(this.selectedVehicle.split(' ')[0])) {
          // netAmount = netAmount + j.netAmount;
          this.data.push(j)
          netAmount = netAmount + parseFloat(j.netAmount.toString());
          // console.log(j.netAmount, netAmount);
          //     this.jobsData.push({
          //       jobCardNo: j.jobCardNo, jobCardDate: j.jobCardDate, registrationNumber: j.registrationNumber,
          //       modelName: j.modelName, partNo: s.partNo, partName: s.partName, quantity: s.quantity, netAmount: s.netAmount
          //     })
        }

        // })

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

  report() {
    const data: any = []
    this.data.map((item, index) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.jobCardNo)
      arr.push(item.jobCardDate)
      arr.push(item.registrationNumber)
      arr.push(item.modelName)
      arr.push(item.kmCovered)
      arr.push(item.netAmount)
      data.push(arr);
    })
    this.generateReport(data);
  }

  generateReport(body: any[]) {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    doc.text("VEHICLE CONSUMPTION REPORT", 50, 15)
    doc.setFontSize(10);
    doc.text(companyName, 80, 22);
    doc.line(14, 30, 196, 30);

    // doc.autoTable({ html: '#excel-table' })

    doc.setFontSize(8);
    doc.text("From Date:", 14, 36)
    doc.text(this.endDate, 163, 36)
    doc.text("To Date:", 150, 36);
    doc.text(this.startDate, 30, 36);

    // TODO to get address use this
    // this.accounts[this.getAccountIndex(res.supplierName)]

    doc.line(14, 40, 196, 40);
    // doc.setFontSize(8);

    // doc.text("Bill No: " + this.partInwardForm.value.transactionNo.toString(), 14, 40)
    // doc.text("Firm Name: ", 14, 45)

    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Card No.",
        "Job Date",
        "Vehicle No.",
        "Model Name",
        "KM Covered",
        "Net Amount",
      ]],
      body: body,
      theme: 'striped',
      styles: {
        // halign: 'right',
        fontSize: 7
      },
      headStyles: {
        fontSize: 7
      },
      // headStyles: {
      //   valign: 'middle',
      //   halign: 'left'
      // },
      // headStyles: { 0: { halign: 'center' }, 1: { halign: 'left' } },
      didParseCell: function (head: any, data: any) {
        if (head.cell.raw === 'Sr.No.') {
          head.cell.styles.halign = 'center'
        }
        if (head.cell.raw === 'KM Covered' || head.cell.raw === 'Net Amount') {
          head.cell.styles.halign = 'right'
        }
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'left' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
      startY: 45,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    // styles: { cellPadding: 0.5, fontSize: 8 },
    const tableHeight = doc.lastAutoTable.finalY;
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    doc.text("Net Amount:", 175, tableHeight + 10, { align: 'right' })
    doc.text(this.totalCost.toFixed(2), 195, tableHeight + 10, { align: 'right' })
    // doc.line(14, tableHeight + 45, 196, tableHeight + 45);

    doc.line(14, doc.internal.pageSize.height - 30, 196, doc.internal.pageSize.height - 30);

    // if (tableHeight < doc.internal.pageSize.height - 50) {
    //   doc.text('Signature', 14, doc.internal.pageSize.height - 30);
    //   doc.text('Seal', 150, doc.internal.pageSize.height - 30);
    // }
    // doc.save("report-purchase.pdf");
    window.open(doc.output('bloburl'), '_blank');
  }

  inWords(num: any) {
    var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str;
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
