import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Transaction } from 'src/app/models/transactions';
import { CategoryService } from 'src/app/services/category.service';
import { TransactionService } from 'src/app/services/transactions.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import * as XLSX from 'xlsx';
import { Route, Router } from '@angular/router';
import { transition } from '@angular/animations';

@Component({
  selector: 'app-transaction',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionComponent {
  private fileName: string = 'Transactions Data ' + new Date().toISOString().substring(0, 10) + '.xlsx';
  public data: any[] = [];
  public Transaction: any = {};
  public showNewTransactionForm: boolean = false;
  public TransactionForm: FormGroup;
  public editTransactionFlag: boolean = false;
  public categorys: any[] = [];
  public categroysObj: any = {};
  public selectedDevice: string = '';
  public fileToUpload: File | null = null;
  public file: any;
  public files: any;
  public showFileUpload: boolean = false;
  public invoiceNo: string = '';
  public selectedTransaction: any = {}
  public editPassword: string = ''
  public selectedRowIndex = -1;
  @ViewChild('closeModal') closeModal: any;
  @ViewChild('pwd') pwd: any;
  constructor(private TransactionSerivce: TransactionService,
    private router: Router,
    private categoryService: CategoryService, private spinner: SpinnerService) {
    this.TransactionForm = new FormGroup({
      transactionNo: new FormControl(''),
      paymentMode: new FormControl(''),
      supplierInvoiceNo: new FormControl(''),
      supplierName: new FormControl(''),
      date: new FormControl(''),
      grossAmount: new FormControl(''),
      gst: new FormControl(''),
      tradeDiscount: new FormControl(''),
      igst: new FormControl(''),
      grandTotal: new FormControl(''),
      cashDiscount: new FormControl(''),
      otherCharges: new FormControl(''),
      netAmount: new FormControl(''),
    })
  }
  ngOnInit(): void {
    this.getAllTransactions();
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

  getAllTransactions() {
    this.spinner.showSpinner();
    this.TransactionSerivce.getTransactions().subscribe((res: any) => {
      this.spinner.hideSpinner();
      this.data = res;
    });
  }

  initializeForm() {
    this.TransactionForm = new FormGroup({
      transactionNo: new FormControl(''),
      paymentMode: new FormControl(''),
      supplierInvoiceNo: new FormControl(''),
      supplierName: new FormControl(''),
      date: new FormControl(''),
      grossAmount: new FormControl(''),
      gst: new FormControl(''),
      tradeDiscount: new FormControl(''),
      igst: new FormControl(''),
      grandTotal: new FormControl(''),
      cashDiscount: new FormControl(''),
      otherCharges: new FormControl(''),
      netAmount: new FormControl(''),
    })
  }
  newTransaction(type: string = 'new') {
    // this.editTransactionFlag = true
    // this.showNewTransactionForm = true
    // this.TransactionSerivce.saveTransaction({
    //   "transactionNo": this.data.length > 0 ? this.data.length : 1,
    //   "paymentMode": "",
    //   "supplierInvoiceNo": 0,
    //   "supplierName": "",
    //   "date": "",
    //   "data": [],
    //   "grossAmount": 0,
    //   "gst": 0,
    //   "tradeDiscount": 0,
    //   "igst": 0,
    //   "grandTotal": 0,
    //   "cashDiscount": 0,
    //   "otherCharges": 0,
    //   "netAmount": 0,
    //   "comment": ""
    // }).subscribe(res => {
    this.cancel();
    const data = this.data.sort()
    const transactionNo = data[0]?.transactionNo
    if (type === 'new') {

      this.router.navigate(['part-inward', transactionNo > 0 ? transactionNo + 1 : 1]);// this.data.length > 0 ? this.data.length : 1]);
    } else {
      this.router.navigate(['part-repaired', transactionNo > 0 ? transactionNo + 1 : 1]);
    }
    // this.getAllTransactions();
    // })
  }

  toggleDetails(i: number, transaction: Transaction) {
    this.selectedRowIndex = this.selectedRowIndex !== i ? i : -1
    // console.log(this.data[this.selectedRowIndex].partNumber);
    // this.getPartNoTransactions(product.partNumber);
    // this.getJobsData(product.partNumber)
  }

  setSelectedTransaction(transaction: Transaction) {
    this.selectedTransaction = transaction;
    setTimeout(() => {
      this.pwd.nativeElement.focus();
    }, 500)
  }


  editTransactionOnEnter(e: any) {
    if (e.keyCode === 13) {
      this.editTransaction(this.selectedTransaction);
    }
  }

  editTransaction(transaction: Transaction) {
    if (this.editPassword === 'VY') {
      this.closeModal.nativeElement.click()
      if (transaction.type === 'repaired') {
        this.router.navigate(['part-repaired', transaction.transactionNo]);
      } else {
        this.router.navigate(['part-inward', transaction.transactionNo]);
      }


    }
    return;
    this.editTransactionFlag = true
    this.showNewTransactionForm = true
    this.TransactionForm = new FormGroup({
      transactionNo: new FormControl(transaction.transactionNo),
      paymentMode: new FormControl(transaction.paymentMode),
      supplierInvoiceNo: new FormControl(transaction.supplierInvoiceNo),
      supplierName: new FormControl(transaction.supplierName),
      date: new FormControl(transaction.date),
      grossAmount: new FormControl(transaction.grossAmount),
      gst: new FormControl(transaction.gst),
      tradeDiscount: new FormControl(transaction.tradeDiscount),
      igst: new FormControl(transaction.igst),
      grandTotal: new FormControl(transaction.grandTotal),
      cashDiscount: new FormControl(transaction.cashDiscount),
      otherCharges: new FormControl(transaction.otherCharges),
      netAmount: new FormControl(transaction.netAmount),
    })
  }

  saveTransaction(transaction: Transaction) {
    const transactionData = {
      "transactionNo": this.data.length > 0 ? this.data[0].transactionNo + 1 : 1,
    }
    if (this.TransactionForm.valid && transaction._id) {
      // update
      this.TransactionSerivce.updateTransaction(transaction._id, this.TransactionForm.value).subscribe(res => {
        this.cancel();
        this.getAllTransactions();
      })
    } else if (this.TransactionForm.valid) {
      // save 
      this.TransactionSerivce.saveTransaction({
        "transactionNo": this.data.length > 0 ? this.data[0].transactionNo + 1 : 1,
        "paymentMode": "",
        "supplierInvoiceNo": 0,
        "supplierName": "",
        "date": "12/12/2022",
        "data": [],
        "grossAmount": 0,
        "gst": 0,
        "tradeDiscount": 0,
        "igst": 0,
        "grandTotal": 0,
        "cashDiscount": 0,
        "otherCharges": 0,
        "netAmount": 0,
        "comment": ""
      }).subscribe(res => {
        this.cancel();
        this.router.navigate(['part-inward']);
        // this.getAllTransactions();
      })
    }
  }

  cancel() {
    this.editTransactionFlag = false
    this.showNewTransactionForm = false;
    this.initializeForm();
  }

  filterResults(categoryID: string) {
    if (categoryID) {
      this.spinner.showSpinner();
      this.TransactionSerivce.getTransactionsByCategory(categoryID).subscribe((res: any) => {
        this.spinner.hideSpinner();
        this.data = res;
      });
    } else {
      this.getAllTransactions();
    }
  }

  deleteTransaction(id: string) {
    this.spinner.showSpinner();
    this.TransactionSerivce.deleteTransaction(id).subscribe(() => {
      this.spinner.hideSpinner(); this.getAllTransactions();
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
    this.TransactionSerivce.uploadFile(this.files[0]).subscribe(res => {
      this.getAllTransactions();
      this.showFileUpload = false;
      this.files = [];
      this.spinner.hideSpinner();
    })
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