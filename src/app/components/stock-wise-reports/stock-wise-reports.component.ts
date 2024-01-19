import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import { companyName } from 'src/app/constants';
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
  public totalOpeningStockValue = 0;
  public totalClosingStockValue = 0;
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
    this.totalOpeningStockValue = 0
    this.totalClosingStockValue = 0;
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
      const openingStockValue = (opening * d.saleRate);
      const closingStockValue = (closingQty * (d.newRate ? d.newRate : d.saleRate || 0))
      this.totalOpeningStockValue = this.totalOpeningStockValue + openingStockValue;
      this.totalClosingStockValue = this.totalClosingStockValue + closingStockValue;
      this.newData.push({
        partNumber: d.partNumber,
        partName: d.partName,
        unit: d.unit,
        opening: opening ? opening : 0,
        openingStockValue: openingStockValue.toFixed(2),
        purchasedQty: purchasedQty,
        consumedQty, closingQty,
        saleRate: (d.newRate ? d.newRate : d.saleRate || 0).toFixed(2),
        closingRate: (d.quantity * d.saleRate).toFixed(2),
        closingStockValue: Math.abs(closingStockValue).toFixed(2)
      })
      // console.log(d.partNumber, d.partName, opening ? opening : 0, purchasedQty, consumedQty, closingQty, d.saleRate, d.quantity * d.saleRate)
    })
    // console.log('-->', this.openingQuantity, this.totalPurchasedQty, this.totalConsumedQty, this.closingQuanity, this.totalItemSaleRate, this.totalSaleRate)
  }


  report() {
    const data: any = []
    this.newData.map((item, index) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.partNumber)
      arr.push(item.partName)
      arr.push(item.unit)
      arr.push(item.opening)
      arr.push(item.purchasedQty)
      arr.push(item.consumedQty)
      arr.push(item.closingQty)
      arr.push(item.saleRate)
      arr.push(item.closingStockValue)
      data.push(arr);
    })
    this.generateReport(data);
  }

  generateReport(body: any[]) {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    doc.text("STOCK REPORT", 80, 15)
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
        "Part No.",
        "Part Name",
        "Unit",
        "Opening",
        "Purchased",
        "Consumped",
        "Closing",
        "Rate",
        "Closing Stock Value"
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
        if (head.cell.raw === 'Closing Stock Value' || head.cell.raw === 'Rate') {
          head.cell.styles.halign = 'right'
        }
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'left' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' } },
      startY: 45,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    // styles: { cellPadding: 0.5, fontSize: 8 },
    const tableHeight = doc.lastAutoTable.finalY;
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    doc.text("Net Amount:", 175, tableHeight + 10, { align: 'right' })
    doc.text(this.totalClosingStockValue.toFixed(2), 195, tableHeight + 10, { align: 'right' })
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

