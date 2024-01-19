import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import { companyName } from 'src/app/constants';
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
  selector: 'app-parts-repaired',
  templateUrl: './parts-repaired.component.html',
  styleUrls: ['./parts-repaired.component.scss']
})
export class PartsRepairedComponent {

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
  public repairableProducts: any[] = []
  public repairableCategoryID = '';
  public activeMenu = '';
  @ViewChild('closebutton') closebutton: any;
  @ViewChild('toast') toast: any;
  @ViewChild('paymentMode') paymentMode: any;

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
      // this.getTransaction(this.transactionNumber);
    })
    this.router.events.subscribe(res => {
      this.activeMenu = window.location.pathname.split('/')[1]
      console.log(this.activeMenu)
    })
    this.transaction = {};
    this.modes = ['Cash', 'Credit']
    this.partInwardForm = new FormGroup({
      transactionNo: new FormControl(this.transactionNumber, Validators.required),
      paymentMode: new FormControl('', Validators.required),
      supplierInvoiceNo: new FormControl('', Validators.required),
      supplierName: new FormControl('', Validators.required),
      date: new FormControl(new Date().toISOString().substring(0, 10), Validators.required),
      partNo: new FormControl(''),
      partName: new FormControl(''),
      ledgerPageNumber: new FormControl(''),
      rate: new FormControl(''),
      newRate: new FormControl(''),
      unit: new FormControl(''),
      quantity: new FormControl(''),
      discountPercentage: new FormControl(''),
      discount: new FormControl(''),
      labourCharges: new FormControl(''),
      otherCharges: new FormControl(''),
      otherChargesDesc: new FormControl(''),
      lgstPercentage: new FormControl(''),
      lgst: new FormControl(''),
      lnetAmount: new FormControl(''),
      gstPercentage: new FormControl(''),
      gst: new FormControl(''),
      partNetAmount: new FormControl(''),
      netAmount: new FormControl(''),
      total: new FormControl(''),
      totalGST: new FormControl(''),
      totalGSTPercentage: new FormControl(''),
      grossAmount: new FormControl(''),
      gstTotal: new FormControl(''),
      tradeDiscount: new FormControl('0'),
      igst: new FormControl(''),
      grandTotal: new FormControl(''),
      roundOff: new FormControl(''),
      cashDiscount: new FormControl(''),
      totalNetAmount: new FormControl(''),
      comment: new FormControl(''),
      type: new FormControl(''),
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
    // this.getAllProducts();
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
      this.categorys.map(c => {
        if (c.categoryName.toLowerCase().includes('repair')) {
          this.repairableCategoryID = c._id
        }
      })
      // this.categorys.forEach(c => {
      //   this.categroysObj[c._id] = c.categoryName;
      // });
      this.getAllProducts();
    })
  }

  getAllProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = res;
      this.repairableProducts = this.products.filter((p: Product) => p.partName.toLocaleLowerCase().includes('repaired'));
      console.log(this.repairableProducts);
    })
  }

  getGRoups() {
    this.groupService.getGroups().subscribe((res: any) => {
      // this.groups = res;
      res.map((g: any) => {
        if (g.groupName.toLowerCase().includes('service provider')) {
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
      if (!res) {
        this.transaction = {};
        this.data = [];
        this.partInwardForm = new FormGroup({
          transactionNo: new FormControl(this.transactionNumber, Validators.required),
          paymentMode: new FormControl('', Validators.required),
          supplierInvoiceNo: new FormControl('', Validators.required),
          supplierName: new FormControl('', Validators.required),
          date: new FormControl(new Date().toISOString().substring(0, 10), Validators.required),
          partNo: new FormControl(''),
          partName: new FormControl(''),
          ledgerPageNumber: new FormControl(''),
          rate: new FormControl(''),
          newRate: new FormControl(''),
          unit: new FormControl(''),
          quantity: new FormControl(''),
          discountPercentage: new FormControl(''),
          discount: new FormControl(''),
          labourCharges: new FormControl(''),
          otherCharges: new FormControl(''),
          otherChargesDesc: new FormControl(''),
          lgstPercentage: new FormControl(''),
          lgst: new FormControl(''),
          lnetAmount: new FormControl(''),
          gstPercentage: new FormControl(''),
          gst: new FormControl(''),
          total: new FormControl(''),
          totalGST: new FormControl(''),
          totalGSTPercentage: new FormControl(''),
          partNetAmount: new FormControl(''),
          netAmount: new FormControl(''),
          grossAmount: new FormControl(''),
          gstTotal: new FormControl(''),
          tradeDiscount: new FormControl('0'),
          igst: new FormControl(''),
          grandTotal: new FormControl(''),
          roundOff: new FormControl(''),
          cashDiscount: new FormControl(''),
          totalNetAmount: new FormControl(''),
          comment: new FormControl(''),
          type: new FormControl(''),
        })
        // setTimeout(() => {
        //   // this.partInwardForm.patchValue({
        //   //   supplierName: this.accounts[this.getAccountIndex(res.supplierName)]
        //   // })
        // }, 100)
        this.cancelUpdate()
      } else {
        if (res.type && res.type !== 'repaired') {
          this.router.navigate(['part-inward', this.transactionNumber]);
        }
        this.transaction = res;
        this.data = res.data;
        this.partInwardForm = new FormGroup({
          transactionNo: new FormControl(this.transactionNumber, Validators.required),
          paymentMode: new FormControl(res.paymentMode, Validators.required),
          supplierInvoiceNo: new FormControl(res.supplierInvoiceNo, Validators.required),
          supplierName: new FormControl('', Validators.required),
          date: new FormControl(res.date ? res.date : new Date().toISOString().substring(0, 10), Validators.required),
          partNo: new FormControl(''),
          partName: new FormControl(''),
          ledgerPageNumber: new FormControl(''),
          rate: new FormControl(''),
          newRate: new FormControl(''),
          unit: new FormControl(''),
          quantity: new FormControl(''),
          discountPercentage: new FormControl(''),
          discount: new FormControl(''),
          labourCharges: new FormControl(''),
          otherCharges: new FormControl(''),
          otherChargesDesc: new FormControl(''),
          lgstPercentage: new FormControl(''),
          lgst: new FormControl(''),
          lnetAmount: new FormControl(''),
          gstPercentage: new FormControl(''),
          gst: new FormControl(''),
          total: new FormControl(''),
          totalGST: new FormControl(''),
          totalGSTPercentage: new FormControl(''),
          netAmount: new FormControl(''),
          partNetAmount: new FormControl(''),
          grossAmount: new FormControl(res.grossAmount.toFixed(2)),
          gstTotal: new FormControl(res.gst.toFixed(2)),
          tradeDiscount: new FormControl('0'),
          igst: new FormControl(''),
          grandTotal: new FormControl(res.grandTotal.toFixed(2)),
          roundOff: new FormControl(res.roundOff ? res.roundOff.toFixed(2) : 0),
          cashDiscount: new FormControl(''),
          totalNetAmount: new FormControl(res.netAmount.toFixed(2)),
          comment: new FormControl(res.comment),
          type: new FormControl(res.type),
        })
        setTimeout(() => {
          this.partInwardForm.patchValue({
            supplierName: this.accounts[this.getAccountIndex(res.supplierName)]
          })
        }, 100)
      }


    })
  }
  setSupplier(e: any) {
    this.partInwardForm.patchValue({
      supplierName: e.accountName
    })
    this.checkExisting()
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
      tradeDiscount: '0',
      igst: '',
      grandTotal: '',
      roundOff: '',
      cashDiscount: '',
      otherCharges: '',
      totalNetAmount: '',
      comment: '',
    })
    this.ngOnInit();
    this.router.navigate(['part-inward', this.transactions.length > 0 ? this.transactions.length + 1 : 1]);
    return
  };

  checkExisting() {
    let isExist = false;
    if (this.partInwardForm.value.supplierName && this.partInwardForm.value.supplierInvoiceNo) {
      const supplier = typeof (this.partInwardForm.value.supplierName) === 'string' ? this.partInwardForm.value.supplierName : this.partInwardForm.value.supplierName.accountName
      const result = this.transactions.find(t => t.supplierInvoiceNo === this.partInwardForm.value.supplierInvoiceNo && t.supplierName === supplier)
      // console.log(result)
      if (result) {
        isExist = true;
        alert('Supplier Invoice No ' + result.supplierInvoiceNo + ' with Supplier ' + result.supplierName + ' is Exist in Transaction No ' + result.transactionNo + ' On this Date ' + result.date)
      }
    }
    return isExist;
  }

  saveTransaction() {
    // if (this.checkExisting()) {
    //   return;
    // }

    if (this.partInwardForm.valid && this.data.length > 0) {
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
        roundOff: this.partInwardForm.value.roundOff,
        netAmount: this.partInwardForm.value.totalNetAmount,
        comment: this.partInwardForm.value.comment,
        data: this.data,
        type: 'repaired'
      }
      if (this.transaction._id) {
        this.transactionService.updateTransaction(this.transaction._id, payload).subscribe(res => {
          // this.router.navigate(['transactions'])
          this.data.map(async p => {
            const product: any = this.products[this.getProductIndex(p.partNo)];
            product.saleRate = p.rate;
            product.newRate = p.newRate ? p.newRate : 0;
            // product.quantity = parseInt(product.quantity) + parseInt(p.quantity);
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
          // this.router.navigate(['transactions'])
          this.transaction = res;
          this.data.map(async p => {
            const product: any = this.products[this.getProductIndex(p.partNo)];
            product.saleRate = p.rate;
            product.newRate = p.newRate ? p.newRate : 0;
            // product.quantity = parseInt(product.quantity) + parseInt(p.quantity);
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
      rate: this.selectedProduct?.saleRate

    })
  }

  setDiscount() {
    if (this.partInwardForm.value.discountPercentage > 0) {
      const originalPrice = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const discount = (originalPrice / 100) * this.partInwardForm.value.discountPercentage;
      this.partInwardForm.patchValue({ discount: discount })
    } else {
      this.partInwardForm.patchValue({ discount: 0 })
    }
  }
  setGST() {
    if (this.partInwardForm.value.gstPercentage) {
      const amount = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const gst = (amount * this.partInwardForm.value.gstPercentage) / 100;
      const total = amount + gst //this.partInwardForm.value.labourCharges;
      this.partInwardForm.patchValue({
        gst: parseFloat(gst.toString()).toFixed(2),
        partNetAmount: parseFloat(total.toString()).toFixed(2)
      })
    } else {
      const amount = this.partInwardForm.value.rate * this.partInwardForm.value.quantity;
      const total = amount;// this.partInwardForm.value.labourCharges;
      this.partInwardForm.patchValue({
        gst: 0,
        partNetAmount: parseFloat(total.toString()).toFixed(2)
      })
    }
  }

  setLGST() {
    if (this.partInwardForm.value.lgstPercentage) {
      const amount = this.partInwardForm.value.labourCharges + this.partInwardForm.value.otherCharges;
      const gst = (amount * this.partInwardForm.value.lgstPercentage) / 100;
      const total = amount + gst;// + this.partInwardForm.value.labourCharges;
      this.partInwardForm.patchValue({
        lgst: parseFloat(gst.toString()).toFixed(2),
        lnetAmount: parseFloat(total.toString()).toFixed(2),
      })
    } else {
      const amount = this.partInwardForm.value.labourCharges + this.partInwardForm.value.otherCharges;
      const total = this.partInwardForm.value.labourCharges + this.partInwardForm.value.otherCharges;
      this.partInwardForm.patchValue({
        lgst: 0,
        lnetAmount: parseFloat(total.toString()).toFixed(2),
      })
    }
    this.setTotal();
  }

  setTotal() {
    const total = parseFloat(this.partInwardForm.value.partNetAmount) + parseFloat(this.partInwardForm.value.lnetAmount)
    const gst = parseFloat(this.partInwardForm.value.gst) + parseFloat(this.partInwardForm.value.lgst)
    const percentage = parseInt(this.partInwardForm.value.gstPercentage) + parseInt(this.partInwardForm.value.lgstPercentage)
    this.partInwardForm.patchValue({
      total: total.toFixed(2),
      netAmount: total.toFixed(2),
      totalGST: gst.toFixed(2),
      totalGSTPercentage: percentage
    })
  }

  cancelUpdate() {
    this.partInwardForm.patchValue({
      partNo: '',
      partName: '',
      quantity: 0,
      rate: 0,
      unit: '',
      discountPercentage: 0,
      discount: 0,
      labourCharges: 0,
      otherCharges: 0,
      otherChargesDesc: '',
      // grossAmount: 0,
      lgstPercentage: 0,
      lgst: 0,
      lnetAmount: 0,
      netAmount: 0,
      gstPercentage: 0,
      gst: 0,
      partNetAmount: 0,
      total: 0,
      totalGST: 0,
      totalGSTPercentage: 0
    })
    this.selectedProduct = {};
    this.selectedIndex = -1
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
        unit: data.unit,
        discountPercentage: data.discountPercentage,
        discount: data.discount,
        labourCharges: data.labourCharges,
        otherCharges: data.otherCharges,
        otherChargesDesc: data.otherChargesDesc,
        // grossAmount: (data.rate * data.quantity),
        lgstPercentage: data.lgstPercentage,
        lgst: data.lgst,
        totalGST: data.totalGST,
        total: data.total,
        lnetAmount: data.lnetAmount,
        gstPercentage: data.gstPercentage,
        gst: data.cgstAmount,
        netAmount: data.netAmount,
        partNetAmount: data.partNetAmount
      })
    }, 100)

  }

  deleteData(index: number) {
    this.data.splice(index, 1);
    this.calculateTotal()
  }

  addData() {
    if (this.partInwardForm.invalid) return;
    const gross = parseFloat(this.partInwardForm.value.rate) * parseFloat(this.partInwardForm.value.quantity) + parseFloat(this.partInwardForm.value.labourCharges) + parseFloat(this.partInwardForm.value.otherCharges)
    if (this.selectedProduct && this.selectedIndex > -1) {
      this.data[this.selectedIndex] = {
        partNo: this.partInwardForm.value.partNo?.partNumber,
        partName: this.partInwardForm.value.partName?.partName,
        quantity: this.partInwardForm.value.quantity,
        rate: this.partInwardForm.value.rate,
        ledgerPageNumber: this.partInwardForm.value.partName?.ledgerPageNumber,
        newRate: this.partInwardForm.value.netAmount / this.partInwardForm.value.quantity,
        unit: this.partInwardForm.value.unit,
        // discountPercentage: this.partInwardForm.value.discountPercentage,
        // discount: this.partInwardForm.value.discount.toFixed(2),
        labourCharges: this.partInwardForm.value.labourCharges,
        otherCharges: this.partInwardForm.value.otherCharges,
        otherChargesDesc: this.partInwardForm.value.otherChargesDesc,
        lgstPercentage: this.partInwardForm.value.lgstPercentage,
        lgst: this.partInwardForm.value.lgst,
        gstPercentage: this.partInwardForm.value.gstPercentage,
        totalGST: this.partInwardForm.value.totalGST,
        lnetAmount: this.partInwardForm.value.lnetAmount,
        partNetAmount: this.partInwardForm.value.partNetAmount,
        grossAmount: gross.toFixed(2),
        sgstPercentage: parseInt(this.partInwardForm.value.totalGSTPercentage) / 2,
        sgstAmount: (this.partInwardForm.value.totalGST / 2).toFixed(2),
        cgstPercentage: parseInt(this.partInwardForm.value.totalGSTPercentage) / 2,
        cgstAmount: (this.partInwardForm.value.totalGST / 2).toFixed(2),
        total: this.partInwardForm.value.total,
        netAmount: this.partInwardForm.value.netAmount
      }
    }
    else {
      this.data.push({
        partNo: this.partInwardForm.value.partNo?.partNumber,
        partName: this.partInwardForm.value.partName?.partName,
        quantity: this.partInwardForm.value.quantity,
        rate: this.partInwardForm.value.rate,
        ledgerPageNumber: this.partInwardForm.value.partName?.ledgerPageNumber,
        newRate: this.partInwardForm.value.netAmount / this.partInwardForm.value.quantity,
        unit: this.partInwardForm.value.unit,
        discountPercentage: this.partInwardForm.value.discountPercentage,
        discount: this.partInwardForm.value.discount,
        labourCharges: this.partInwardForm.value.labourCharges ? this.partInwardForm.value.labourCharges.toFixed(2) : '0',
        otherCharges: this.partInwardForm.value.otherCharges ? this.partInwardForm.value.otherCharges.toFixed(2) : '0',
        otherChargesDesc: this.partInwardForm.value.otherChargesDesc,
        lgstPercentage: this.partInwardForm.value.lgstPercentage,
        totalGST: this.partInwardForm.value.totalGST,
        lgst: this.partInwardForm.value.lgst,
        gst: this.partInwardForm.value.gstPercentage,
        gstPercentage: this.partInwardForm.value.gstPercentage,
        lnetAmount: this.partInwardForm.value.lnetAmount,
        partNetAmount: this.partInwardForm.value.partNetAmount,
        grossAmount: gross.toFixed(2),
        sgstPercentage: parseInt(this.partInwardForm.value.totalGSTPercentage) / 2,
        sgstAmount: (this.partInwardForm.value.totalGST / 2).toFixed(2),
        cgstPercentage: parseInt(this.partInwardForm.value.totalGSTPercentage) / 2,
        cgstAmount: (this.partInwardForm.value.totalGST / 2).toFixed(2),
        total: this.partInwardForm.value.total,
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
    // let total = 0
    let netAmount = 0;
    this.data.map(d => {
      grossAmount = grossAmount + parseFloat(d.grossAmount);
      gst = gst + parseFloat(d.sgstAmount) + parseFloat(d.cgstAmount);
      // discount = discount + parseFloat(d.discount);
      netAmount = netAmount + parseFloat(d.total)
    })
    const total = grossAmount;
    netAmount = total + gst + this.partInwardForm.value.roundOff;
    // netAmount = netAmount + g;
    this.partInwardForm.patchValue({
      grossAmount: parseFloat(grossAmount.toString()).toFixed(2),
      gstTotal: parseFloat(gst.toString()).toFixed(2),
      // roundOff: parseFloat(discount.toString()).toFixed(2),
      grandTotal: parseFloat(total.toString()).toFixed(2),
      totalNetAmount: parseFloat(netAmount.toString()).toFixed(2),
    })
  }

  report() {
    // const doc1 = new jsPDF()
    const data: any = []
    this.data.map((item, index) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.partNo + ' ' + item.partName)
      arr.push(item.quantity)
      arr.push(item.unit)
      arr.push(item.ledgerPageNumber)
      arr.push(item.rate)
      arr.push(item.labourCharges)
      arr.push(item.grossAmount)
      arr.push(item.lgstPercentage ? item.lgstPercentage + '%' : '0')
      arr.push(item.gst ? item.gst + '%' : '0')
      arr.push(item.totalGST);
      arr.push(item.total)
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
    // doc.text("Wishvayodha Multitrade", 14, 20);
    doc.setFontSize(8);
    doc.text("Service Provider Invoice No:", 140, 30)
    // doc.setFont('', 'bold');
    doc.text(this.partInwardForm.value.supplierInvoiceNo.toString(), 177, 30)
    doc.text("Service Provider Name:", 14, 30);
    doc.text(this.partInwardForm.value.supplierName?.accountName, 45, 30);

    // TODO to get address use this
    // this.accounts[this.getAccountIndex(res.supplierName)]

    doc.line(14, 35, 196, 35);
    doc.setFontSize(8);

    doc.text("Bill No: " + this.partInwardForm.value.transactionNo.toString(), 14, 40)
    doc.text("Firm Name: " + companyName, 14, 45)

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
        "Unit",
        "Ladger No.",
        "Rate",
        "Labour Charges",
        "Gross Amount",
        "Labour GST%",
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
    doc.text('INR In Word: ' + this.inWords(parseInt(this.partInwardForm.value.totalNetAmount)), 14, tableHeight + 10)
    if (this.partInwardForm.value.comment) {
      doc.text('Remarks: \n' + this.partInwardForm.value.comment, 14, tableHeight + 15)
    }
    doc.text("Basic Amount:", 150, tableHeight + 15, { align: 'right' })
    doc.text(this.partInwardForm.value.grossAmount, 180, tableHeight + 15, { align: 'right' })
    doc.text("CGST Amount:", 150, tableHeight + 20, { align: 'right' })
    const gst: number = parseFloat(this.partInwardForm.value.gstTotal) / 2;
    doc.text(gst.toFixed(2), 180, tableHeight + 20, { align: 'right' })
    doc.text("SGST Amount:", 150, tableHeight + 25, { align: 'right' })
    doc.text(gst.toFixed(2), 180, tableHeight + 25, { align: 'right' })
    doc.text("Total Discount:", 150, tableHeight + 30, { align: 'right' })
    let discount = '0';
    // if (this.partInwardForm.value.tradeDiscount ) {
    //   discount = '- ' + this.partInwardForm.value.tradeDiscount.toString()
    // }
    doc.text(discount, 180, tableHeight + 30, { align: 'right' })
    doc.text("Round Off:", 150, tableHeight + 35, { align: 'right' })
    doc.text(this.partInwardForm.value.roundOff, 180, tableHeight + 35, { align: 'right' })
    doc.line(14, tableHeight + 40, 196, tableHeight + 40);
    doc.text("Net Amount:", 150, tableHeight + 45, { align: 'right' })
    doc.text(this.partInwardForm.value.totalNetAmount, 180, tableHeight + 45, { align: 'right' })
    doc.line(14, tableHeight + 50, 196, tableHeight + 50);

    doc.line(14, doc.internal.pageSize.height - 55, 196, doc.internal.pageSize.height - 55);

    if (tableHeight < doc.internal.pageSize.height - 55) {
      doc.text('Signature', 14, doc.internal.pageSize.height - 30);
      doc.text('Seal', 150, doc.internal.pageSize.height - 30);
    }
    // doc.save("report-purchase.pdf");
    window.open(doc.output('bloburl'), '_blank');
  }

  test1() {
    const num = parseInt(this.partInwardForm.value.totalNetAmount);
    console.log(this.inWords(num), this.partInwardForm.value.totalNetAmount)
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
}
