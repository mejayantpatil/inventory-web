import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import { Job } from 'src/app/models/jobs';
import { CategoryService } from 'src/app/services/category.service';
import { JobService } from 'src/app/services/jobs.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-job-wise-consumption-reports',
  templateUrl: './job-wise-consumption-reports.component.html',
  styleUrls: ['./job-wise-consumption-reports.component.scss']
})
export class JobWiseConsumptionReportsComponent {
  private fileName: string = 'Job Wise Consumption Report ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public startDate: string = new Date(new Date().setDate(1)).toISOString().substring(0, 10);
  public endDate: string = new Date().toISOString().substring(0, 10);
  public data: any[] = [];
  public Job: any = {};
  public categorys: any[] = [];
  public categroysObj: any = {};
  public jobCardNo: string = '';
  public originalData: any = [];
  public selectedJob: any = {};
  public selectedRowIndex = -1;
  public status: string = 'all';
  public totalCost = 0;
  public showTable: boolean = false;
  public jobs: any[] = [];
  @ViewChild('closeModal') closeModal: any
  constructor(private jobService: JobService,
    private router: Router,
    private categoryService: CategoryService, private spinner: SpinnerService) {

  }
  ngOnInit(): void {
    this.getAllJobs();
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

  getAllJobs() {
    this.spinner.showSpinner();

    this.jobService.getJobByDate(this.startDate, this.endDate).subscribe((res: any) => {
      this.spinner.hideSpinner();
      const data = res;
      this.totalCost = 0;
      this.originalData = res;
      res.forEach((j: any) => {
        this.totalCost = this.totalCost + parseFloat(j.netAmount);
      })
      // res.forEach((i: any) => {
      //   let arr = {}
      //   i.cardData.map((c: any, index: number) => {
      //     if (index > 0) return;
      //     arr = { _id: i._id, jobCardNo: i.jobCardNo, ...c };
      //     data.push(arr);
      //   })
      // })
      data.sort((a: Job, b: Job) => {
        const aa = parseInt(a.jobCardNo)
        const bb = parseInt(b.jobCardNo)
        return aa - bb;
      });
      this.data = data;
      this.jobs = data;
      // this.data = data.reverse();
    });
  }
  filterResults(categoryID: string) {
    if (categoryID) {
      this.data = this.jobs.filter((d: any) => d.spareParts.some((s: any) => s.categoryId === categoryID))
    } else {
      this.data = this.jobs
    }
  }

  search() {
    this.showTable = true;
    this.status = 'all'
    this.getAllJobs();
  }

  filterJobs() {
    switch (this.status) {
      case 'running':
        this.data = this.originalData.filter((d: any) => d.status.toLowerCase() === this.status)
        this.totalCost = 0;
        this.data.forEach((j: any) => {
          this.totalCost = this.totalCost + parseFloat(j.netAmount);
        })
        break;
      case 'complete':
        this.totalCost = 0;
        this.data = this.originalData.filter((d: any) => d.status.toLowerCase() === this.status)
        this.data.forEach((j: any) => {
          this.totalCost = this.totalCost + parseFloat(j.netAmount);
        })
        break;
      default: this.data = this.originalData;
        this.totalCost = 0;
        this.data.forEach((j: any) => {
          this.totalCost = this.totalCost + parseFloat(j.netAmount);
        })
    }
  }


  report() {
    const data: any = []
    this.data.map((item, index) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.jobCardNo)
      arr.push(item.paymentMode)
      arr.push(item.jobCardDate)
      arr.push(item.registrationNumber)
      arr.push(item.modelName)
      arr.push(item.kmCovered)
      arr.push(item.status)
      arr.push(item.netAmount)
      data.push(arr);
    })
    this.generateReport(data);
  }

  generateReport(body: any[]) {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    doc.text("JOB WISE CONSUMPTION REPORT", 40, 15)
    doc.setFontSize(10);
    doc.text("Vishwayoddha Shetkari Multitrade", 80, 22);
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
    // doc.text("Firm Name: Vishwayoddha Shetkari Multitrade", 14, 45)

    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Job No.",
        "Mode",
        "Job Date",
        "Vehicle No.",
        "Model Name",
        "KM Covered",
        "Status",
        "Net Amount",
      ]],
      body: body,
      theme: 'striped',
      styles: {
        // halign: 'right',
        fontSize: 8
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
        if (head.cell.raw === 'Net Amount') {
          head.cell.styles.halign = 'right'
        }
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'left' }, 8: { halign: 'right' } },
      startY: 45,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    // styles: { cellPadding: 0.5, fontSize: 8 },
    const tableHeight = doc.lastAutoTable.finalY;
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    // doc.text("Total Quantiy:", 175, tableHeight + 10, { align: 'right' })
    // doc.text(this.totalQuantity.toString(), 195, tableHeight + 10, { align: 'right' })
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
