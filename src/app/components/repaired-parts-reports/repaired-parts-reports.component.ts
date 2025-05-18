import { Component, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import { companyName } from 'src/app/constants';
import { Account } from 'src/app/models/account';
import { AccountService } from 'src/app/services/accounts.service';
import { GroupService } from 'src/app/services/groups.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { TransactionService } from 'src/app/services/transactions.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-repaired-parts-reports',
  templateUrl: './repaired-parts-reports.component.html',
  styleUrls: ['./repaired-parts-reports.component.scss']
})
export class RepairedPartsReportsComponent {
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
      // if (t.netAmount > 500000) {
      //   console.log(t)
      // }
      if (this.supplierName) {
        let product: any = {}
        let quantity = 0;

        if (this.supplierName === t.supplierName) {
          t.data.map((p: any) => {
            product = this.products.find(pr => (pr.partNumber === p.partNo && p.partName.includes('Repaired')))
            if (product) {
              console.log('isrepaired=', p.partName.includes('Repaired'));

              this.stockPurchased[p.partNo] = parseInt(this.stockPurchased[p.partNo] ? this.stockPurchased[p.partNo] : '0') + parseInt(p.quantity ? p.quantity : 0);
              quantity = quantity + parseInt(p.quantity)
            }
          })
          this.transactionsData.push({
            transactionNo: t.transactionNo, date: t.date, supplierName: t.supplierName,
            netAmount: t.netAmount, quantity: quantity, data: t.data,
            invoiceNo: t.supplierInvoiceNo, gst: t.gst, grandTotal: t.grandTotal
          })
          // console.log(t.netAmount, 'total=', this.totalCost)
          this.totalCost = this.totalCost + t.netAmount
          this.totalQuantity = this.totalQuantity + (quantity ? quantity : 0)
        }
      } else {
        let product: any = {}
        let quantity = 0;
        t.data.map((p: any) => {
          product = this.products.find(pr => (pr.partNumber === p.partNo && p.partName.includes('REPAIRED')))
          // product = this.products.find(pr => pr.partNumber === p.partNo)
          if (product) {
            console.log('isrepaired=', p.partName.includes('REPAIRED'));

            // console.log('isrepaired=', p.partName.includes('REPAIRED'));
            // console.log('product=', product);
            // console.log('p=', p);

            this.stockPurchased[p.partNo] = parseInt(this.stockPurchased[p.partNo] ? this.stockPurchased[p.partNo] : '0') + parseInt(p.quantity ? p.quantity : 0);
            quantity = quantity + parseInt(p.quantity)
          }
        })
        this.transactionsData.push({
          transactionNo: t.transactionNo, date: t.date, supplierName: t.supplierName,
          netAmount: t.netAmount, quantity: quantity, data: t.data,
          invoiceNo: t.supplierInvoiceNo, gst: t.gst, grandTotal: t.grandTotal
        })
        // console.log(t.netAmount, 'total=', this.totalCost)
        this.totalCost = this.totalCost + t.netAmount
        this.totalQuantity = this.totalQuantity + (quantity ? quantity : 0)

      }

    });
    console.log(this.totalCost, this.totalQuantity)
    // console.log(this.transactionsData)
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


  report() {
    const data: any = []
    this.transactionsData.map((item, index) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.transactionNo)
      arr.push(item.date)
      arr.push(item.invoiceNo)
      arr.push(item.supplierName)
      arr.push(item.quantity)
      arr.push(item.gst)
      arr.push(item.grandTotal)
      arr.push(item.netAmount)
      data.push(arr);
    })
    this.generateReport(data);
  }

  generateReport(body: any[]) {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    doc.text("PURCHASE REPORT", 70, 15)
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
        "TN. No.",
        "Date",
        "Invoice No.",
        "Supplier Name",
        "Stock",
        "GST",
        "Grand Total",
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
        if (head.cell.raw === 'GST' || head.cell.raw === 'Grand Total' || head.cell.raw === 'Net Amount') {
          head.cell.styles.halign = 'right'
        }
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'left' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' } },
      startY: 45,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    // styles: { cellPadding: 0.5, fontSize: 8 },
    const tableHeight = doc.lastAutoTable.finalY;
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    doc.text("Total Quantiy:", 175, tableHeight + 10, { align: 'right' })
    doc.text(this.totalQuantity.toString(), 195, tableHeight + 10, { align: 'right' })
    doc.text("Net Amount:", 175, tableHeight + 15, { align: 'right' })
    doc.text(this.totalCost.toFixed(2), 195, tableHeight + 15, { align: 'right' })
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
