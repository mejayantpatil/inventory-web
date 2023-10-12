import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { async } from 'rxjs';
import { Account } from 'src/app/models/account';
import { Group } from 'src/app/models/group';
import { Product } from 'src/app/models/product';
import { Transaction } from 'src/app/models/transactions';
import { AccountService } from 'src/app/services/accounts.service';
import { CategoryService } from 'src/app/services/category.service';
import { GroupService } from 'src/app/services/groups.service';
import { ProductService } from 'src/app/services/products.service';
import { TransactionService } from 'src/app/services/transactions.service';

@Component({
  selector: 'app-parts-inward',
  templateUrl: './parts-inward.component.html',
  styleUrls: ['./parts-inward.component.scss']
})
export class PartsInwardComponent {

  public data: any[] = [];
  public partInwardForm: FormGroup;
  public modes: string[] = [];
  public transactionNumber: string = '';
  public products: Product[] = [];
  public accounts: Account[] = [];
  public selectedQuantity: any;
  public groups: Group[] = [];
  public supplierGroupID: string = '';
  public transaction: any;
  public test: any;
  public selectedProduct: any;
  public selectedIndex = -1;
  public transactions: Transaction[] = [];
  public productForm: FormGroup;
  public categorys: any[] = [];
  @ViewChild('closebutton') closebutton: any;
  @ViewChild('toast') toast: any;
  @ViewChild('paymentMode') paymentMode: any;
  @ViewChild('partNo') partNo: any;
  constructor(private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private accountSerivce: AccountService,
    private productService: ProductService,
    private router: Router,
    private productSerivce: ProductService,
    private categoryService: CategoryService,
    private groupService: GroupService) {
    this.activatedRoute.params.subscribe((params: any) => {
      this.transactionNumber = params.transactionNumber;
      this.getAllTransactions();
      // this.getTransaction(this.transactionNumber);
    })
    this.transaction = {};
    this.modes = ['Cash', 'Credit']
    this.partInwardForm = new FormGroup({
      transactionNo: new FormControl(this.transactionNumber),
      paymentMode: new FormControl('', Validators.required),
      supplierInvoiceNo: new FormControl('', Validators.required),
      supplierName: new FormControl('', Validators.required),
      date: new FormControl(new Date().toISOString().substring(0, 10)),
      partNo: new FormControl(''),
      partName: new FormControl(''),
      rate: new FormControl(''),
      newRate: new FormControl(),
      unit: new FormControl(''),
      quantity: new FormControl(''),
      discountPercentage: new FormControl(''),
      discount: new FormControl(''),
      gstPercentage: new FormControl(''),
      gst: new FormControl(''),
      netAmount: new FormControl(''),
      grossAmount: new FormControl(''),
      gstTotal: new FormControl(''),
      tradeDiscount: new FormControl(''),
      igst: new FormControl(''),
      grandTotal: new FormControl(''),
      cashDiscount: new FormControl(''),
      otherCharges: new FormControl(''),
      totalNetAmount: new FormControl(''),
      comment: new FormControl(''),
    })
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

  ngOnInit() {
    this.getAllProducts();
    this.getGRoups();
    this.getAllTransactions();
    this.getAllCategories();

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

  getAllCategories() {
    this.categoryService.getCategorys().subscribe((res: any) => {
      this.categorys = res;
      // this.categorys.forEach(c => {
      //   this.categroysObj[c._id] = c.categoryName;
      // });
    })
  }

  getAllProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = res;
      this.products = this.products.filter((p: Product) => !p.partName.toLowerCase().includes('repaired'));
    })
  }

  getGRoups() {
    this.groupService.getGroups().subscribe((res: any) => {
      // this.groups = res;
      res.map((g: any) => {
        if (g.groupName.toLowerCase() === 'supplier') {
          this.supplierGroupID = g._id;
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
      this.accounts = this.accounts.filter((a: Account) => a.groupName === this.supplierGroupID);
      this.getTransaction(this.transactionNumber);
    });
  }

  getAccountIndex(accountName: string) {
    return this.accounts.findIndex(a => a.accountName === accountName);
  }

  getProductIndex(partNo: string) {
    return this.products.findIndex(a => a.partNumber === partNo);
  }

  getAllTransactions() {
    this.transactionService.getTransactions().subscribe((res: any) => {
      this.transactions = res;
    })
  }

  getTransaction(transactionNumber: string) {
    this.transactionService.getTransaction(transactionNumber).subscribe((res: any) => {
      if (res) {
        if (res.type && res.type === 'repaired') {
          this.router.navigate(['part-repaired', this.transactionNumber]);
        }
        this.transaction = res;
        this.data = res.data;
        this.partInwardForm = new FormGroup({
          transactionNo: new FormControl(this.transactionNumber),
          paymentMode: new FormControl(res.paymentMode, Validators.required),
          supplierInvoiceNo: new FormControl(res.supplierInvoiceNo, Validators.required),
          supplierName: new FormControl('', Validators.required),
          date: new FormControl(res.date ? res.date : new Date().toISOString().substring(0, 10)),
          partNo: new FormControl(''),
          partName: new FormControl(''),
          rate: new FormControl(''),
          newRate: new FormControl(''),
          unit: new FormControl(''),
          quantity: new FormControl(''),
          discountPercentage: new FormControl(''),
          discount: new FormControl(''),
          gstPercentage: new FormControl(''),
          gst: new FormControl(''),
          netAmount: new FormControl(''),
          grossAmount: new FormControl(res.grossAmount.toFixed(2)),
          gstTotal: new FormControl(res.gst.toFixed(2)),
          tradeDiscount: new FormControl(res.tradeDiscount ? res.tradeDiscount.toFixed(2) : '0'),
          igst: new FormControl(res.igst ? res.igst.toFixed(2) : ''),
          grandTotal: new FormControl(res.grandTotal.toFixed(2)),
          cashDiscount: new FormControl(''),
          otherCharges: new FormControl(''),
          totalNetAmount: new FormControl(res.netAmount.toFixed(2)),
          comment: new FormControl(res.comment),
        })
        setTimeout(() => {
          this.partInwardForm.patchValue({
            supplierName: this.accounts[this.getAccountIndex(res.supplierName)]
          })
        }, 100)
        this.paymentMode.nativeElement.focus();
      } else {

        this.transaction = {};
        this.data = [];// res.data;
        this.partInwardForm = new FormGroup({
          transactionNo: new FormControl(this.transactionNumber, Validators.required),
          paymentMode: new FormControl('', Validators.required),
          supplierInvoiceNo: new FormControl('', Validators.required),
          supplierName: new FormControl('', Validators.required),
          date: new FormControl(new Date().toISOString().substring(0, 10), Validators.required),
          partNo: new FormControl(''),
          partName: new FormControl(''),
          rate: new FormControl(''),
          newRate: new FormControl(''),
          unit: new FormControl(''),
          quantity: new FormControl(''),
          discountPercentage: new FormControl(''),
          discount: new FormControl(''),
          gstPercentage: new FormControl(''),
          gst: new FormControl(''),
          netAmount: new FormControl(''),
          grossAmount: new FormControl(''),
          gstTotal: new FormControl(''),
          tradeDiscount: new FormControl(''),
          igst: new FormControl(''),
          grandTotal: new FormControl(''),
          cashDiscount: new FormControl(''),
          otherCharges: new FormControl(''),
          totalNetAmount: new FormControl(''),
          comment: new FormControl(''),
        })
        // setTimeout(() => {
        //   this.partInwardForm.patchValue({
        //     supplierName: this.accounts[this.getAccountIndex(res.supplierName)]
        //   })
        // }, 100)
        this.paymentMode.nativeElement.focus();

      }

    })
  }
  setSupplier(e: any) {
    this.partInwardForm.patchValue({
      supplierName: e.accountName
    })
  }

  setPartNo(e: any) {
    // this.partInwardForm.patchValue({
    //   partNo: e.partNumber
    // })
    this.setProductField(e);
  }

  setPartName(e: any) {
    // this.partInwardForm.patchValue({
    //   partName: e.partName
    // })
    this.setProductField(e);
  }

  saveTransaction() {
    if (this.partInwardForm.invalid) return;

    if (this.partInwardForm.value.supplierName.accountName && this.data.length > 0 && this.partInwardForm.value.totalNetAmount) {
      const payload = {
        transactionNo: this.partInwardForm.value.transactionNo,
        paymentMode: this.partInwardForm.value.paymentMode,
        supplierInvoiceNo: this.partInwardForm.value.supplierInvoiceNo,
        supplierName: this.partInwardForm.value.supplierName.accountName,
        date: this.partInwardForm.value.date,
        grossAmount: this.partInwardForm.value.grossAmount,
        gst: this.partInwardForm.value.gstTotal,
        tradeDiscount: this.partInwardForm.value.tradeDiscount,
        igst: this.partInwardForm.value.igst,
        grandTotal: this.partInwardForm.value.grandTotal,
        cashDiscount: this.partInwardForm.value.cashDiscount,
        otherCharges: this.partInwardForm.value.otherCharges,
        netAmount: this.partInwardForm.value.totalNetAmount,
        comment: this.partInwardForm.value.comment,
        data: this.data,
        type: 'new'
      }

      if (this.transaction._id) {
        this.transactionService.updateTransaction(this.transaction._id, payload).subscribe(res => {
          // this.router.navigate(['transactions'])
          this.data.map(async p => {
            const product: any = this.products[this.getProductIndex(p.partNo)];
            product.saleRate = p.rate;
            product.newRate = p.newRate
            // product.quantity = parseInt(product.quantity) + parseInt(p.quantity);
            product.purchasedQuantity = p.quantity
            product.unit = p.unit
            product.orderPlaced = false
            await this.productSerivce.updateProduct(product._id, product).subscribe(() => {
              console.log('product updated')
            })
          })
          // TODO toat
          this.toast.nativeElement.setAttribute('class', 'toast show')
          setTimeout(() => {
            this.toast.nativeElement.setAttribute('class', 'toast hide')
          }, 2000)
          // alert('Saved Successfully.')
        })
      } else {
        this.transactionService.saveTransaction(payload).subscribe(res => {
          console.log(res);
          this.transaction = res;
          // this.router.navigate(['transactions'])
          this.data.map(async p => {
            const product: any = this.products[this.getProductIndex(p.partNo)];
            product.saleRate = p.rate;
            product.newRate = p.newRate
            // product.quantity = parseInt(product.quantity) + parseInt(p.quantity);
            product.purchasedQuantity = p.quantity
            product.unit = p.unit
            product.orderPlaced = false
            await this.productSerivce.updateProduct(product._id, product).subscribe(() => {
              console.log('product updated')
            })
          })
          // TODO toat
          this.toast.nativeElement.setAttribute('class', 'toast show')
          setTimeout(() => {
            this.toast.nativeElement.setAttribute('class', 'toast hide')
          }, 2000)
          // alert('Saved Successfully.')
        })
      }

    } else {
      alert('Please enter the valid inputs.')
    }
  }

  setProductField(e: any) {
    let index = -1;

    this.products.map((p: Product, i: number) => {
      if (p.partNumber === e.partNumber) {
        index = i;
        this.selectedProduct = p
      }
    })
    this.partInwardForm.patchValue({
      partNo: index > -1 ? this.products[index] : '',
      partName: index > -1 ? this.products[index] : '',
      quantity: 1,
      unit: this.selectedProduct.unit,
      rate: this.selectedProduct?.saleRate,
      newRate: this.selectedProduct.newRate ? this.selectedProduct.newRate : 0
    })
    this.setGST()
  }

  setRate() {
    if (this.partInwardForm.value.rate > 0 && this.partInwardForm.value.quantity > 0 && this.partInwardForm.value.discount > 0) {
      const amount = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const gst = ((amount - this.partInwardForm.value.discount) * this.partInwardForm.value.gstPercentage) / 100;
      const total = (amount - this.partInwardForm.value.discount) + gst;
      const newRate = total / this.partInwardForm.value.quantity;
      this.partInwardForm.patchValue({
        newRate: this.partInwardForm.value.newRate ? this.partInwardForm.value.newRate : newRate.toFixed(2),
        gst: parseFloat(gst.toString()).toFixed(2),
        netAmount: parseFloat(total.toString()).toFixed(2)
      })
    } else {
      // const amount = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      // const total = amount - this.partInwardForm.value.discount;
      // this.partInwardForm.patchValue({
      //   gst: 0,
      //   netAmount: parseFloat(total.toString()).toFixed(2)
      // })
    }
  }

  setDiscount() {

    if (this.partInwardForm.value.discountPercentage > 0) {
      const originalPrice = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const discount = (originalPrice * this.partInwardForm.value.discountPercentage) / 100;
      const discountOnPrice = (this.partInwardForm.value.rate * this.partInwardForm.value.discountPercentage) / 100;
      // const newRate = this.partInwardForm.value.rate // - discountOnPrice;
      this.partInwardForm.patchValue({ discount: discount })
    } else {
      this.partInwardForm.patchValue({ discount: 0 })
    }
  }
  setGST() {
    if (this.partInwardForm.value.gstPercentage) {
      const amount = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const gst = ((amount - this.partInwardForm.value.discount) * this.partInwardForm.value.gstPercentage) / 100;
      const total = (amount - this.partInwardForm.value.discount) + gst;
      const newRate = total / this.partInwardForm.value.quantity;
      this.partInwardForm.patchValue({
        newRate: this.partInwardForm.value.newRate ? this.partInwardForm.value.newRate : newRate.toFixed(2),
        gst: parseFloat(gst.toString()).toFixed(2),
        netAmount: parseFloat(total.toString()).toFixed(2)
      })
    } else {
      const amount = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const total = amount - this.partInwardForm.value.discount;
      this.partInwardForm.patchValue({
        gst: 0,
        netAmount: parseFloat(total.toString()).toFixed(2)
      })
    }
  }

  cancelUpdate() {
    this.partInwardForm.patchValue({
      partNo: '',
      partName: '',
      quantity: 0,
      rate: 0,
      newRate: 0,
      unit: '',
      discountPercentage: 0,
      discount: 0,
      // grossAmount: 0,
      gstPercentage: 0,
      gst: 0,
      netAmount: 0
    })
    this.selectedProduct = {};
    this.selectedIndex = -1;
    this.partNo.focus();
  }

  update() {
    this.setDiscount()
    this.setGST()
    this.addData();
  }

  editData(index: number) {
    const data = this.data[index];
    this.selectedIndex = index;
    console.log(data)
    this.setProductField({ partNumber: data.partNo });
    setTimeout(() => {
      this.partInwardForm.patchValue({
        quantity: data.quantity,
        rate: data.rate,
        newRate: data.newRate,
        unit: data.unit,
        discountPercentage: data.discountPercentage,
        discount: data.discount,
        // grossAmount: (data.rate * data.quantity),
        gstPercentage: data.cgstPercentage * 2,
        gst: data.cgstAmount * 2,
        netAmount: data.netAmount
      })
    }, 100)

  }

  deleteData(index: number) {
    this.data.splice(index, 1);
    this.calculateTotal()
  }

  addData() {
    if (this.partInwardForm.invalid) return;
    if (this.selectedProduct && this.selectedIndex > -1) {
      this.data[this.selectedIndex] = {
        partNo: this.partInwardForm.value.partNo?.partNumber,
        partName: this.partInwardForm.value.partName?.partName,
        ledgerPageNumber: this.partInwardForm.value.partName?.ledgerPageNumber,
        quantity: this.partInwardForm.value.quantity,
        rate: this.partInwardForm.value.rate,
        newRate: this.partInwardForm.value.newRate,
        unit: this.partInwardForm.value.unit,
        discountPercentage: this.partInwardForm.value.discountPercentage,
        discount: this.partInwardForm.value.discount.toFixed(2),
        grossAmount: (this.partInwardForm.value.rate * this.partInwardForm.value.quantity).toFixed(2),
        sgstPercentage: this.partInwardForm.value.gstPercentage / 2,
        sgstAmount: (this.partInwardForm.value.gst / 2).toFixed(2),
        cgstPercentage: this.partInwardForm.value.gstPercentage / 2,
        cgstAmount: (this.partInwardForm.value.gst / 2).toFixed(2),
        netAmount: this.partInwardForm.value.netAmount
      }
    }
    else {
      this.data.push({
        partNo: this.partInwardForm.value.partNo?.partNumber,
        partName: this.partInwardForm.value.partName?.partName,
        ledgerPageNumber: this.partInwardForm.value.partName?.ledgerPageNumber,
        quantity: this.partInwardForm.value.quantity,
        rate: this.partInwardForm.value.rate.toFixed(2),
        newRate: this.partInwardForm.value.newRate,
        unit: this.partInwardForm.value.unit,
        discountPercentage: this.partInwardForm.value.discountPercentage,
        discount: this.partInwardForm.value.discount,
        grossAmount: (this.partInwardForm.value.rate * this.partInwardForm.value.quantity).toFixed(2),
        sgstPercentage: this.partInwardForm.value.gstPercentage / 2,
        sgstAmount: (this.partInwardForm.value.gst / 2).toFixed(2),
        cgstPercentage: this.partInwardForm.value.gstPercentage / 2,
        cgstAmount: (this.partInwardForm.value.gst / 2).toFixed(2),
        netAmount: this.partInwardForm.value.netAmount
      })
    }
    this.cancelUpdate();
    this.calculateTotal();
  }

  calculateTotal() {
    let grossAmount = 0;
    let gst = 0
    let discount = 0;
    let netAmount = 0;
    this.data.map(d => {
      grossAmount = grossAmount + parseFloat(d.grossAmount);
      gst = gst + parseFloat(d.sgstAmount) + parseFloat(d.cgstAmount);
      discount = discount + parseFloat(d.discount);
      netAmount = netAmount + parseFloat(d.netAmount)
    })
    const total = grossAmount - discount;
    // this.partInwardForm.value.newRate = total / this.partInwardForm.value.quantity;
    // netAmount = netAmount + g;
    this.partInwardForm.patchValue({
      grossAmount: parseFloat(grossAmount.toString()).toFixed(2),
      gstTotal: parseFloat(gst.toString()).toFixed(2),
      tradeDiscount: parseFloat(discount.toString()).toFixed(2),
      grandTotal: parseFloat(total.toString()).toFixed(2),
      totalNetAmount: parseFloat(netAmount.toString()).toFixed(2),
    })
  }

  report() {
    // const doc1 = new jsPDF()
    const data: any = []
    this.data.map((item, index) => {
      const gstpercentage = item.sgstPercentage + item.cgstPercentage;
      const gstAmount = parseFloat(item.sgstAmount) + parseFloat(item.cgstAmount)
      const arr = [];
      arr.push(index + 1)
      arr.push(item.partNo + ' ' + item.partName)
      arr.push(item.quantity)
      arr.push(item.ledgerPageNumber)
      arr.push(item.unit)
      arr.push(item.rate)
      arr.push(item.grossAmount)
      arr.push(item.discountPercentage)
      arr.push(gstpercentage)
      arr.push(gstAmount.toFixed(2));
      arr.push(item.netAmount)
      data.push(arr);
    })

    this.generateReport(data);
    // It can parse html:
    // <table id="my-table"><!-- ... --></table>
    // autoTable(doc1, { html: '#part-inward' })
    // autoTable(doc1, { html: '#excel-table' })

    // // Or use javascript directly:
    // autoTable(doc1, {
    //   head: [['Name', 'Email', 'Country']],
    //   body: [
    //     ['David', 'david@example.com', 'Sweden'],
    //     ['Castille', 'castille@example.com', 'Spain'],
    //     // ...
    //   ],
    //   theme: 'striped',
    // })

    // doc1.text("Date: 12/12/2013", 150, 35)
    // doc1.save('table.pdf')
    // window.open(doc1.output('bloburl'), '_blank');
  }

  generateReport(body: any[]) {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    doc.text("INVOICE", 90, 15)
    // doc.autoTable({ html: '#my-table' })
    doc.setFontSize(8);
    doc.text("Supplier Invoice No:", 140, 30)
    // doc.setFont('', 'bold');
    doc.text(this.partInwardForm.value.supplierInvoiceNo.toString(), 168, 30)
    doc.text("Supplier Name:", 14, 30);
    doc.text(this.partInwardForm.value.supplierName?.accountName, 35, 30);

    // TODO to get address use this
    // this.accounts[this.getAccountIndex(res.supplierName)]

    doc.line(14, 35, 196, 35);
    doc.setFontSize(8);

    doc.text("Bill No: " + this.partInwardForm.value.transactionNo.toString(), 14, 40)
    doc.text("Firm Name: Vishwayoddha Shetkari Multitrade", 14, 45)

    doc.text("Date: " + this.partInwardForm.value.date, 140, 40)
    // doc.text("Firm Name: Wishvayodha Multitrade", 10, 40)
    doc.text("Type: " + this.partInwardForm.value.paymentMode, 140, 45)
    doc.line(14, 50, 196, 50);

    // doc.table(10, 50, this.generateData(10), this.headers, { fontSize: 7, });
    // 
    // const doc2 = new jsPDF();
    // if (this.partInwardForm.value.comment) {
    //   body.push(['', '', '', '', '', '', '', '']);
    //   body.push(['', 'Items Description: \n' + this.partInwardForm.value.comment, '', '', '', '', , '', '']);
    // }
    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Particulars",
        "Quantity",
        "Ledger No.",
        "Unit",
        "Rate",
        "Amount",
        "Discount%",
        "GST%",
        "GST",
        "Net Amount"
      ]],
      body: body,
      theme: 'striped',
      styles: {
        halign: 'right',
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
      createdCell: function (head: any, data: any) {
        if (head.cell.raw === 'Sr.No.') {
          head.cell.styles.halign = 'center'
        }
        if (head.cell.raw === 'Particulars') {
          head.cell.styles.halign = 'left'
        }
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'left' } },
      startY: 55,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    // styles: { cellPadding: 0.5, fontSize: 8 },
    const tableHeight = doc.lastAutoTable.finalY;
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.partInwardForm.value.totalNetAmount)), 14, tableHeight + 10)
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    // doc.text('In Word: RS: ***', 14, tableHeight + 10)
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.partInwardForm.value.totalNetAmount)), 14, tableHeight + 5)
    doc.text('INR In Words: ' + this.inWords(parseInt(this.partInwardForm.value.totalNetAmount)), 14, tableHeight + 10)
    if (this.partInwardForm.value.comment) {
      doc.text('Remarks: \n' + this.partInwardForm.value.comment, 14, tableHeight + 15)
    }
    doc.text("Basic Amount:", 170, tableHeight + 15, { align: 'right' })
    doc.text(this.partInwardForm.value.grossAmount, 195, tableHeight + 15, { align: 'right' })
    doc.text("CGST Amount:", 170, tableHeight + 20, { align: 'right' })
    const gst: number = parseFloat(this.partInwardForm.value.gstTotal) / 2;
    doc.text(gst.toFixed(2), 195, tableHeight + 20, { align: 'right' })
    doc.text("SGST Amount:", 170, tableHeight + 25, { align: 'right' })
    doc.text(gst.toFixed(2), 195, tableHeight + 25, { align: 'right' })
    doc.text("Total Discount:", 170, tableHeight + 30, { align: 'right' })
    let discount = '0';
    if (this.partInwardForm.value.tradeDiscount) {
      discount = '- ' + this.partInwardForm.value.tradeDiscount.toString()
    }
    doc.text(discount, 195, tableHeight + 30, { align: 'right' })
    doc.line(14, tableHeight + 35, 196, tableHeight + 35);
    doc.text("Net Amount:", 170, tableHeight + 40, { align: 'right' })
    doc.text(this.partInwardForm.value.totalNetAmount, 195, tableHeight + 40, { align: 'right' })
    doc.line(14, tableHeight + 45, 196, tableHeight + 45);

    doc.line(14, doc.internal.pageSize.height - 50, 196, doc.internal.pageSize.height - 50);

    if (tableHeight < doc.internal.pageSize.height - 50) {
      doc.text('Signature', 14, doc.internal.pageSize.height - 30);
      doc.text('Seal', 150, doc.internal.pageSize.height - 30);
    }
    // doc.save("report-purchase.pdf");
    window.open(doc.output('bloburl'), '_blank');
  }

  test1() {
    const num = parseInt(this.partInwardForm.value.totalNetAmount);
    // console.log(this.inWords(num), this.partInwardForm.value.totalNetAmount)
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

  loadTransaction(which: string) {
    switch (which) {
      case 'first':
        this.router.navigate(['part-inward', 1])
        break;
      case 'last':
        this.router.navigate(['part-inward', this.transactions.length])
        break;
      case 'next':
        if (this.transactions.length > parseInt(this.transactionNumber)) {
          this.router.navigate(['part-inward', parseInt(this.transactionNumber) + 1])
        }
        break;
      case 'previous':
        if (parseInt(this.transactionNumber) > 1) {
          this.router.navigate(['part-inward', parseInt(this.transactionNumber) - 1])
        }
        break
    }
  }

  addNewProduct() {
    if (this.productForm.valid) {
      // save 
      this.productSerivce.saveProduct(this.productForm.value).subscribe(res => {
        // this.cancel();
        this.closebutton.nativeElement.click();
        this.getAllProducts();
      })
    }
  }

  newTransaction(type: string = 'new') {
    this.data = [];
    // this.partInwardForm.reset();
    this.paymentMode.nativeElement.focus();
    this.partInwardForm.patchValue({
      supplierInvoiceNo: '',
      supplierName: '',
      paymentMode: '',
      transactionNo: this.transactions.length + 1,
      grossAmount: '',
      gstTotal: '',
      tradeDiscount: '',
      igst: '',
      grandTotal: '',
      cashDiscount: '',
      otherCharges: '',
      totalNetAmount: '',
      comment: '',
    })
    this.ngOnInit();
    this.router.navigate(['part-inward', this.transactions.length > 0 ? this.transactions.length + 1 : 1]);
    return
    // this.editTransactionFlag = true
    // this.showNewTransactionForm = true
    // return null;
    this.transactionService.getTransactions().subscribe((allT: any) => {
      this.transactions = allT;
      this.transactionService.saveTransaction({
        "transactionNo": this.transactions.length > 0 ? this.transactions.length : 1,
        "paymentMode": "",
        "supplierInvoiceNo": 0,
        "supplierName": "",
        "date": "",
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
        this.ngOnInit();
        this.data = [];
        this.paymentMode.nativeElement.focus();
        if (type === 'new') {
          this.router.navigate(['part-inward', this.transactions.length > 0 ? this.transactions.length : 1]);
        } else {
          this.router.navigate(['part-repaired', this.transactions.length > 0 ? this.transactions.length : 1]);
        }

      })
    })
  }
}
