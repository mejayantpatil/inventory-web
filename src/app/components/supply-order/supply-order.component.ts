import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Account } from 'src/app/models/account';
import { Product } from 'src/app/models/product';
import { AccountService } from 'src/app/services/accounts.service';
import { GroupService } from 'src/app/services/groups.service';
import { ProductService } from 'src/app/services/products.service';
import { SupplyOrderService } from 'src/app/services/supplyOrderService';
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf';
import { CategoryService } from 'src/app/services/category.service';
import { TransactionService } from 'src/app/services/transactions.service';
import { JobService } from 'src/app/services/jobs.service';


@Component({
  selector: 'app-supply-order',
  templateUrl: './supply-order.component.html',
  styleUrls: ['./supply-order.component.scss']
})
export class SupplyOrderComponent {
  public fileName = 'purchase order.xlsx';
  public supplyOrders: any = [];
  public showNewSupplyOrderForm: boolean = false;
  public supplyOrderForm: FormGroup;
  public accounts: any = [];
  public supplierGroupID: string = '';
  public products: Product[] = [];
  public productsWithLowQty: any[] = [];
  public partsData: any = [];
  public selectedProduct: any;
  public selectedIndex = -1;
  public categroysObj: any = {};
  public newOrder: boolean = false;
  public selectedOrderId = ''
  public transactions: any = [];
  public selectAll: boolean = false;
  public stockPurchased: any = {}
  public supplierNameObj: any = {}
  public stockConsumed: any = {}
  public showMessage: boolean = false
  @ViewChild('partNo') partNo: any;
  @ViewChild('toast') toast: any;

  constructor(private supplyOrderService: SupplyOrderService,
    private categoryService: CategoryService,
    private groupService: GroupService,
    private productService: ProductService,
    private transactionService: TransactionService,
    private jobService: JobService,
    private accountSerivce: AccountService) {
    this.supplyOrderForm = new FormGroup({
      // partsData: new []
      supplyOrderNumber: new FormControl('', Validators.required),
      supplierName: new FormControl('', Validators.required),
      totalQuantity: new FormControl(''),
      totalAmount: new FormControl(''),
      partNo: new FormControl(''),
      partName: new FormControl(''),
      quantity: new FormControl(''),
      unit: new FormControl(''),
      rate: new FormControl(''),
      netAmount: new FormControl(''),
      date: new FormControl(new Date().toISOString().substring(0, 10)),
      totalNetAmount: new FormControl(''),
      status: new FormControl('Pending'),
      gst: new FormControl(''),
      comment: new FormControl('')

    })
  }
  ngOnInit() {
    this.getGRoups();
    this.getAllOrders();
    this.getAllCategories();
    this.getAllTransactions();
  }

  getAllOrders() {
    this.supplyOrderService.getSupplyOrders().subscribe((res: any) => {
      this.supplyOrders = res;
    })
  }

  getAllCategories() {
    this.categoryService.getCategorys().subscribe((res: any) => {
      // this.categorys = res;
      res.forEach((c: any) => {
        this.categroysObj[c._id] = c.categoryName;
      });
    })
  }
  getAllTransactions() {
    this.transactionService.getTransactions().subscribe((res: any) => {
      this.transactions = res.filter((r: any) => r.supplierName === this.supplyOrderForm.value.supplierName?.accountName);
      res.map((t: any) => {
        t.data.map((i: any) => {

          this.stockPurchased[i.partNo] = parseInt(this.stockPurchased[i.partNo] ? this.stockPurchased[i.partNo] : '0') + parseInt(i.quantity);
          // this.stockPuchasedValues[i.partNo] = i.newRate ? i.newRate : 0
          this.supplierNameObj[i.partNo] = { gst: i.cgstPercentage + i.sgstPercentage, supplierName: t.supplierName }
        })
      });
      this.getAllProducts();
    })
  }

  getAllJobs() {
    this.jobService.getJobs().subscribe((res: any) => {
      res.map((t: any) => {
        t.cardData.map((c: any) => {
          c?.spareParts && c?.spareParts.map((i: any) => {
            // if (t.status === 'Complete') {
            this.stockConsumed[i.partNo] = parseInt(this.stockConsumed[i.partNo] ? this.stockConsumed[i.partNo] : 0) + parseInt(i.quantity);
            // this.totalConsumedQty = this.totalConsumedQty + i.quantity;
            // }
          })
        })
      })
    })
  }

  getAllProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = res;
      this.products = this.products.filter((p: Product) => !p.partName.toLocaleLowerCase().includes('repair'));
      res.map((p: any) => {
        const qty = (p.quantity ? p.quantity : 0) + (this.stockPurchased[p.partNumber] ? this.stockPurchased[p.partNumber] : 0) - (this.stockConsumed[p.partNumber] ? this.stockConsumed[p.partNumber] : 0)
        if (qty <= 10) {
          this.productsWithLowQty.push({
            checked: false,
            partName: p.partName,
            partNumber: p.partNumber,
            quantity: qty,
            rate: p.newRate ? p.newRate : p.saleRate,
            unit: p.unit,
            gst: this.supplierNameObj[p.partNumber] ? this.supplierNameObj[p.partNumber].gst : 0,
            supplierName: this.supplierNameObj[p.partNumber] ? this.supplierNameObj[p.partNumber].supplierName : ''
          })
        }
      })
    })
  }

  addToSupplyOrder() {
    let orders: any = []
    let supplierObj: any = {}
    this.products.map((p: any) => {
      let partsData: any = [];
      if (p.checked) {
        partsData.push({
          partNo: p.partNumber,
          partName: p.partName,
          quantity: p.quantity,
          rate: p.newRate ? p.newRate : p.rate,
          unit: p.unit,
          gst: p.gst,
          categoryId: '',
        });
        if (supplierObj[p.supplierName]) {
          supplierObj[p.supplierName].push(...partsData);

        } else {
          supplierObj[p.supplierName] = partsData;
        }
      }
    })
    if (Object.keys(supplierObj).length === 0) {
      alert('Please select products');
      return;
    }
    Object.keys(supplierObj).map(s => {
      let qty = 0;
      let total = 0;
      supplierObj[s].map((p: any) => {
        qty = qty + p.quantity
        total = total + parseFloat(p.netAmount)
      })
      orders.push({
        partsData: supplierObj[s],
        supplyOrderNumber: this.supplyOrders.length + 1,
        supplierName: s,
        totalQuantity: qty,
        totalAmount: total,
        comment: '',
        status: 'Pending',
        date: new Date().toISOString().substring(0, 10)
      })
    });
    let count = this.supplyOrders.length + 1;
    orders.map(async (o: any) => {
      o.supplyOrderNumber = count;
      count++;
      await this.supplyOrderService.saveSupplyOrder(o).subscribe(res => {
        console.log('ok')
      })
    })
    this.unCheckAll();
    console.log('done')
    this.showToast();
  }

  showToast() {
    // TODO toat
    this.showMessage = true;
    this.toast.nativeElement.setAttribute('class', 'toast show')
    setTimeout(() => {
      this.showMessage = false;
      this.toast.nativeElement.setAttribute('class', 'toast hide')
    }, 2000)
  }

  setProductField(e: any) {
    let index = -1;
    this.products.map((p: Product, i: number) => {
      if (p.partNumber === e.partNumber) {
        index = i;
        this.selectedProduct = p
      }
    })
    let lastGst = 0;
    this.transactions.map((t: any) => {
      t.data && t.data.map((p: any) => {
        if (this.selectedProduct.partNumber === p.partNo && lastGst === 0) {
          console.log(p.partNo, p.sgstPercentage, p.cgstPercentage)
          lastGst = p.sgstPercentage + p.cgstPercentage;
        }
      })
    })
    this.supplyOrderForm.patchValue({
      partNo: index > -1 ? this.products[index] : '',
      partName: index > -1 ? this.products[index] : '',
      quantity: 10,
      unit: this.selectedProduct.unit,
      gst: lastGst,
      rate: this.selectedProduct?.newRate ? this.selectedProduct?.newRate : this.selectedProduct?.saleRate
    })
    // this.setAmount();
  }

  setAmount() {
    const total = this.supplyOrderForm.value.quantity * this.supplyOrderForm.value.rate;
    this.supplyOrderForm.patchValue({
      netAmount: total.toFixed(2)
    })
    // this.addData();
  }

  deleteData(index: number) {
    this.partsData.splice(index, 1);
    this.calculateTotal()
  }

  calculateTotal() {
    let netAmount = 0;
    let totalQuantity = 0;
    this.partsData.map((p: any) => {
      totalQuantity = totalQuantity + parseFloat(p.quantity);
      netAmount = netAmount + parseFloat(p.netAmount ? p.netAmount.toFixed(2) : parseFloat(p.rate) * p.quantity)
    })
    console.log(this.partsData)
    this.supplyOrderForm.patchValue({
      totalQuantity: totalQuantity,
      totalNetAmount: netAmount,
    })
    // this.cancelUpdate();

  }

  editData(index: number) {
    const spareParts = this.partsData[index];
    this.selectedIndex = index;
    console.log(spareParts)
    this.setProductField({ partNumber: spareParts.partNo });
    setTimeout(() => {
      this.supplyOrderForm.patchValue({
        quantity: spareParts.quantity,
        rate: spareParts.rate,
        unit: spareParts.unit,
        netAmount: spareParts.netAmount
      })
    }, 100)

  }

  checkAll() {
    this.products.map((p: any) => {
      p.checked = !p.checked;
    })
  }

  unCheckAll() {
    this.selectAll = false;
    this.products.map((p: any) => {
      p.checked = false;
    })
  }

  cancelUpdate() {
    this.supplyOrderForm.patchValue({
      partNo: '',
      partName: '',
      quantity: 0,
      rate: 0,
      gst: 0,
      unit: '',
      netAmount: 0,
    })
    this.selectedProduct = {};
    this.selectedIndex = -1

  }

  addData() {
    if (this.supplyOrderForm.invalid) return;
    if (this.selectedProduct && this.selectedIndex > -1) {
      this.partsData[this.selectedIndex] = {
        partNo: this.supplyOrderForm.value.partNo?.partNumber,
        partName: this.supplyOrderForm.value.partName?.partName,
        quantity: this.supplyOrderForm.value.quantity,
        rate: this.supplyOrderForm.value.rate,
        unit: this.supplyOrderForm.value.unit,
        gst: this.supplyOrderForm.value.gst,
        categoryId: this.supplyOrderForm.value.partName.category,
        netAmount: this.supplyOrderForm.value.quantity * this.supplyOrderForm.value.rate
      }
    }
    else {
      this.partsData.push({
        partNo: this.supplyOrderForm.value.partNo?.partNumber,
        partName: this.supplyOrderForm.value.partName?.partName,
        quantity: this.supplyOrderForm.value.quantity,
        rate: this.supplyOrderForm.value.rate ? this.supplyOrderForm.value.rate.toFixed(2) : 0,
        unit: this.supplyOrderForm.value.unit,
        gst: this.supplyOrderForm.value.gst,
        categoryId: this.supplyOrderForm.value.partName.category,
        netAmount: this.supplyOrderForm.value.quantity * this.supplyOrderForm.value.rate
      })
    }
    this.calculateTotal();
    this.cancelUpdate();
    this.partNo.focus();
  }
  setPartNo(e: any) {
    // this.supplyOrderForm.patchValue({
    //   partNo: e.partNumber
    // })
    this.setProductField(e);
  }
  setPartName(e: any) {
    // this.supplyOrderForm.patchValue({
    //   partName: e.partName
    // })
    this.setProductField(e);
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
    });
  }

  newSupplyOrder() {
    this.newOrder = true
    this.showNewSupplyOrderForm = true;
    this.selectedOrderId = '';

    this.partsData = [];
    this.cancelUpdate();
    this.supplyOrderForm.patchValue({ Comment: '', supplierName: '', supplyOrderNumber: this.supplyOrders.length > 0 ? this.supplyOrders[this.supplyOrders.length - 1].supplyOrderNumber + 1 : 1 })

  }

  cancel() {
    this.showNewSupplyOrderForm = false;
  }

  setSupplier(e: any) {
    this.supplyOrderForm.patchValue({
      supplierName: e.accountName
    })
    this.getAllTransactions()
  }
  editSupplyOrder(supplyOrder: any) {
    this.newOrder = false
    this.showNewSupplyOrderForm = true;
    this.selectedOrderId = supplyOrder._id;
    this.partsData = supplyOrder.partsData;
    this.supplyOrderForm.patchValue({
      supplyOrderNumber: supplyOrder.supplyOrderNumber,
      supplierName: supplyOrder.supplierName,
      totalQuantity: supplyOrder.totalQuantity,
      totalAmount: supplyOrder.totalAmount,
      partNo: supplyOrder.partNo,
      partName: supplyOrder.partName,
      quantity: supplyOrder.quantity,
      unit: supplyOrder.unit,
      rate: supplyOrder.rate,
      comment: supplyOrder.comment,
      totalNetAmount: supplyOrder.totalAmount
    })
    this.calculateTotal();
  }

  deleteSupplyOrder(id: string) {
    this.supplyOrderService.deleteSupplyOrder(id).subscribe(() => {
      this.getAllOrders();
    })
  }
  completeOrder(order: any) {
    order.status = 'Complete'
    this.supplyOrderService.updateSupplyOrder(order._id, order).subscribe(res => {

      // this.printOrder()
      this.getAllOrders();
      // this.cancelUpdate();

      // this.showNewSupplyOrderForm = false;
    })
  }

  saveSupplyOrder() {
    const payload = {
      partsData: this.partsData,
      supplyOrderNumber: this.supplyOrderForm.value.supplyOrderNumber,
      supplierName: this.supplyOrderForm.value.supplierName.accountName,
      totalQuantity: this.supplyOrderForm.value.totalQuantity,
      totalAmount: this.supplyOrderForm.value.totalNetAmount,
      comment: this.supplyOrderForm.value.comment,
      status: this.supplyOrderForm.value.status,
      date: this.supplyOrderForm.value.date
    }
    if (this.newOrder) {
      this.supplyOrderService.saveSupplyOrder(payload).subscribe(res => {

        // this.printOrder()
        this.cancelUpdate();
        this.getAllOrders();
        // this.showNewSupplyOrderForm = false;
        this.showToast()
      })
    } else {
      this.supplyOrderService.updateSupplyOrder(this.selectedOrderId, payload).subscribe(res => {

        // this.printOrder()
        this.getAllOrders();
        this.cancelUpdate();
        this.showToast()
        // this.showNewSupplyOrderForm = false;
      })
    }

  }


  printOrder() {
    const data: any = []
    const categoriesWiseData: any = {}
    console.log('partsData', this.partsData);
    this.partsData.map((item: any, index: number) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.partNo)
      arr.push(item.partName)
      arr.push(item.quantity)
      arr.push(item.unit)
      arr.push(item.gst + '%')
      arr.push(item.rate)
      arr.push(item.netAmount ? item.netAmount.toFixed(2) : '0')
      arr.push(item.categoryId);
      data.push(arr);
      // categoriesWiseData[item.categoryId] = [];
    })
    // this.generateReport(data);
    // console.log('cat data', categoriesWiseData);
    const newData: any = [];
    let count = 1;
    // Object.keys(categoriesWiseData).map(c => {
    let arr = [];
    // arr.push('')
    // arr.push(this.categroysObj[c])
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // newData.push(arr);
    let total = 0;
    data.map((item: any, index: number) => {
      arr = [];
      // console.log(c, item[item.length - 1], index)
      // if (item[item.length - 1] === c) {
      arr.push(count)
      arr.push(item[1])
      arr.push(item[2])
      arr.push(item[3])
      arr.push(item[4])
      arr.push(item[5])
      arr.push(item[6])
      arr.push(item[7])
      // total = total + parseFloat(item[6])
      newData.push(arr);
      count++
      // }
    })
    // arr = [];
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('')
    // arr.push('Total')
    // arr.push(total.toFixed(2))
    // newData.push(arr);
    // })
    console.log(newData)
    this.generateReport(newData);

  }

  generateReport(body: any[]) {
    const doc: any = new jsPDF({ putOnlyUsedFonts: true });
    doc.setFontSize(20);
    // doc.text("Invoice", 90, 15)
    doc.text("PURCHASE ORDER", 100, 15, { align: 'center' })

    // doc.setFontSize(8);
    // doc.text("Order By: Vishwayoddha Shetkari Multitrade", 100, 2, { align: 'center' })
    // doc.setFontSize(7);
    // doc.text("Address: Katraj, Pune.", 100, 25, { align: 'center' })

    // doc.autoTable({ html: '#my-table' })
    // doc.text("Wishvayodha Multitrade", 14, 20);
    doc.setFontSize(10);
    // doc.setFontSize(8);
    doc.text("Supplier Name:", 14, 30)
    doc.text(this.supplyOrderForm.value.supplierName.accountName ? this.supplyOrderForm.value.supplierName.accountName : this.supplyOrderForm.value.supplierName, 40, 30);

    doc.text("Purchase Order No:", 145, 30)
    doc.text(this.supplyOrderForm.value.supplyOrderNumber.toString(), 180, 30);

    doc.text("Order Date: ", 14, 35)
    doc.text(this.supplyOrderForm.value.date, 40, 35);

    doc.line(14, 40, 196, 40);
    doc.text("Order By: Vishwayoddha Shetkari Multitrade", 14, 45)
    // doc.setFontSize(7);
    doc.text("Address: Katraj, Pune.", 14, 50)

    // doc.text("Job Card No:", 14, 35);
    // doc.text(this.supplyOrderForm.value.jobCardNo, 35, 35);
    // doc.text("Bill Date:", 150, 35)
    // doc.setFont('', 'bold');
    // doc.text(this.supplyOrderForm.value.jobCardDate, 175, 35)
    // doc.line(14, 38, 196, 38);

    // doc.text("Vehicle Number:", 14, 45);
    // doc.text(this.supplyOrderForm.value.registrationNumber.vehicleNumber, 45, 45);
    // doc.text("Model Name:", 120, 45)
    // doc.text(this.supplyOrderForm.value.modelName, 145, 45)

    // doc.text("Mechanic Name:", 14, 50);
    // doc.text(this.supplyOrderForm.value?.mechanicName?.accountName, 45, 50);
    // doc.text("KM Covered:", 120, 50)
    // doc.text(this.supplyOrderForm.value.kmCovered.toString(), 145, 50)

    // doc.text("GST No:", 14, 55);
    // doc.text("Payment Mode:", 14, 55)
    // doc.text(this.supplyOrderForm.value.paymentMode, 45, 55)

    doc.line(14, 55, 196, 55);
    // TODO to get address use this
    // this.accounts[this.getAccountIndex(res.mechanicName)]

    // doc.line(14, 35, 196, 35);
    // doc.setFontSize(8);

    // doc.text("Bill No: " + this.supplyOrderForm.value.jobCardNo.toString(), 14, 40)
    // doc.text("Firm Name: Wishvayodha Multitrade", 14, 45)

    // doc.text("Date: " + this.supplyOrderForm.value.jobCardDate, 140, 40)
    // // doc.text("Firm Name: Wishvayodha Multitrade", 10, 40)
    // doc.text("Type: " + this.supplyOrderForm.value.paymentMode, 140, 45)
    // doc.line(14, 50, 196, 50);

    // doc.table(10, 60, this.generateData(10), this.headers, { fontSize: 7, });
    // 
    // const doc2 = new jsPDF();
    // if (this.supplyOrderForm.value.comment) {
    //   body.push(['', '', '', '', '', '', '', '']);
    //   body.push(['', 'Items Description: \n' + this.supplyOrderForm.value.comment, '', '', '', '', , '', '']);
    // }
    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Part No.",
        "Part Name",
        "Quantity",
        "Unit",
        "GST%",
        "Last Rate",
        "Net Amount"
      ]],
      body: body,
      theme: 'striped',
      styles: {
        halign: 'right',
        fontSize: 8
      },
      // headStyles: {
      //   valign: 'middle',
      //   halign: 'left'
      // },
      // headStyles: { 0: { halign: 'center' }, 1: { halign: 'left' } },
      createdCell: function (head: any, data: any) {
        if (head.cell.raw === 'Sr.No.') {
          console.log('sr.no.', head.cell);
          head.cell.styles.halign = 'center'
        }
        if (head.cell.raw === 'Part No.' || head.cell.raw === 'Part Name') {
          console.log('name', head.cell);
          head.cell.styles.halign = 'left'
        }

      },
      didDrawCell: function (hookData: any) {

        if (hookData.section === 'body') {
          if (hookData.row.raw[0] === '') {
            for (let cell of Object.values(hookData.row.cells)) {
              (cell as any).styles.fontStyle = 'bold';
            }
          }
        }
      },
      columnStyles: { 0: { halign: 'center' }, 1: { halign: 'left' }, 2: { halign: 'left' } },
      startY: 65,
      margin: [10, 15, 30, 15] // top left bottom left
    });
    // styles: { cellPadding: 0.5, fontSize: 8 },
    const tableHeight = doc.lastAutoTable.finalY;
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.supplyOrderForm.value.totalNetAmount)), 14, tableHeight + 10)
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    // doc.text('In Word: RS: ***', 14, tableHeight + 10)
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.supplyOrderForm.value.totalNetAmount)), 14, tableHeight + 5)
    // doc.text('INR In Words: ' + this.inWords(parseInt(this.supplyOrderForm.value.totalNetAmount)), 14, tableHeight + 10)
    if (this.supplyOrderForm.value.comment) {
      doc.text('Remarks: \n' + this.supplyOrderForm.value.comment, 14, tableHeight + 15)
    }
    doc.text("Grand Total Amount:", 165, tableHeight + 15, { align: 'right' })
    doc.text(this.supplyOrderForm.value.totalNetAmount ? this.supplyOrderForm.value.totalNetAmount.toFixed(2) : '0', 195, tableHeight + 15, { align: 'right' })
    // doc.text("CGST Amount:", 150, tableHeight + 20, { align: 'right' })
    // const gst: number = parseFloat(this.supplyOrderForm.value.gstTotal) / 2;
    // doc.text(gst.toFixed(2), 180, tableHeight + 20, { align: 'right' })
    // doc.text("SGST Amount:", 150, tableHeight + 25, { align: 'right' })
    // doc.text(gst.toFixed(2), 180, tableHeight + 25, { align: 'right' })
    // doc.text("Total Discount:", 150, tableHeight + 30, { align: 'right' })
    // let discount = '0';
    // if (this.supplyOrderForm.value.tradeDiscount) {
    //   discount = '- ' + this.supplyOrderForm.value.tradeDiscount.toString()
    // }
    // doc.text(discount, 180, tableHeight + 30, { align: 'right' })
    // doc.line(14, tableHeight + 35, 196, tableHeight + 35);
    // doc.text("Net Amount:", 150, tableHeight + 40, { align: 'right' })
    // doc.text(this.supplyOrderForm.value.totalNetAmount.toFixed(2), 180, tableHeight + 40, { align: 'right' })
    // doc.line(14, tableHeight + 45, 196, tableHeight + 45);

    doc.line(14, doc.internal.pageSize.height - 50, 196, doc.internal.pageSize.height - 50);

    if (tableHeight < doc.internal.pageSize.height - 50) {
      doc.text('Signature', 150, doc.internal.pageSize.height - 20);
      doc.text('Seal', 150, doc.internal.pageSize.height - 30);
    }
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
