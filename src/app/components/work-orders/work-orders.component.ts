import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import jsPDF from 'jspdf';
import { Account } from 'src/app/models/account';
import { Product } from 'src/app/models/product';
import { AccountService } from 'src/app/services/accounts.service';
import { CategoryService } from 'src/app/services/category.service';
import { GroupService } from 'src/app/services/groups.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { TransactionService } from 'src/app/services/transactions.service';
import { WorkOrderService } from 'src/app/services/work-order.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.component.html',
  styleUrls: ['./work-orders.component.scss']
})
export class WorkOrdersComponent {
  public fileName = 'woek order.xlsx';
  public workOrders: any = [];
  public showNewWorkOrderForm: boolean = false;
  public workOrderForm: FormGroup;
  public accounts: any = [];
  public supplierGroupID: string = '';
  public products: Product[] = [];
  public partsData: any = [];
  public selectedProduct: any;
  public selectedIndex = -1;
  public categroysObj: any = {};
  public newOrder: boolean = false;
  public selectedOrderId = ''
  public transactions: any = [];
  public selectAll = false;
  public productsWithLowQty: any[] = []
  public stockPurchased: any = {}
  public supplierNameObj: any = {}
  public stockConsumed: any = {}

  @ViewChild('partNo') partNo: any;

  constructor(private workOrderService: WorkOrderService,
    private categoryService: CategoryService,
    private groupService: GroupService,
    private jobService: JobService,
    private productService: ProductService,
    private transactionService: TransactionService,
    private accountSerivce: AccountService) {
    this.workOrderForm = new FormGroup({
      // partsData: new []
      workOrderNumber: new FormControl(''),
      serviceProviderName: new FormControl(''),
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
    // this.getAllProducts();
    this.getGRoups();
    this.getAllOrders();
    this.getAllCategories();
    this.getAllTransactions();
  }

  getAllOrders() {
    this.workOrderService.getWorkOrders().subscribe((res: any) => {
      this.workOrders = res;
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


  getAllTransactions() {
    this.transactionService.getTransactions().subscribe((res: any) => {
      this.transactions = res.filter((r: any) => r.supplierName === this.workOrderForm.value.serviceProviderName?.accountName);
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

  getAllProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = res;
      // this.products.map(p => {
      // this.openingStock[p.partNumber] = p.quantity;
      // })
      this.products = this.products.filter((p: Product) => p.partName.toLocaleLowerCase().includes('repair'));
      this.products.map((p: any) => {
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
          lastGst = p.sgstPercentage + p.cgstPercentage;
        }
      })
    })
    this.workOrderForm.patchValue({
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
    const total = this.workOrderForm.value.quantity * this.workOrderForm.value.rate;
    this.workOrderForm.patchValue({
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
      netAmount = netAmount + p.netAmount
    })
    this.workOrderForm.patchValue({
      totalQuantity: totalQuantity,
      totalNetAmount: netAmount
    })
    // this.cancelUpdate();

  }

  editData(index: number) {
    const spareParts = this.partsData[index];
    this.selectedIndex = index;
    this.setProductField({ partNumber: spareParts.partNo });
    setTimeout(() => {
      this.workOrderForm.patchValue({
        quantity: spareParts.quantity,
        rate: spareParts.rate,
        unit: spareParts.unit,
        netAmount: spareParts.netAmount
      })
    }, 100)

  }



  cancelUpdate() {
    this.workOrderForm.patchValue({
      partNo: '',
      partName: '',
      quantity: 0,
      rate: 0,
      gst: 0,
      unit: '',
      netAmount: 0
    })
    this.selectedProduct = {};
    this.selectedIndex = -1
  }

  addData() {
    if (this.workOrderForm.invalid) return;
    if (this.selectedProduct && this.selectedIndex > -1) {
      this.partsData[this.selectedIndex] = {
        partNo: this.workOrderForm.value.partNo?.partNumber,
        partName: this.workOrderForm.value.partName?.partName,
        quantity: this.workOrderForm.value.quantity,
        rate: this.workOrderForm.value.rate,
        unit: this.workOrderForm.value.unit,
        gst: this.workOrderForm.value.gst,
        categoryId: this.workOrderForm.value.partName.category,
        netAmount: parseFloat(this.workOrderForm.value.rate) * this.workOrderForm.value.quantity
      }
    }
    else {
      this.partsData.push({
        partNo: this.workOrderForm.value.partNo?.partNumber,
        partName: this.workOrderForm.value.partName?.partName,
        quantity: this.workOrderForm.value.quantity,
        rate: this.workOrderForm.value.rate ? this.workOrderForm.value.rate.toFixed(2) : 0,
        unit: this.workOrderForm.value.unit,
        gst: this.workOrderForm.value.gst,
        categoryId: this.workOrderForm.value.partName.category,
        netAmount: parseFloat(this.workOrderForm.value.rate) * this.workOrderForm.value.quantity
      })
    }
    this.calculateTotal();
    this.cancelUpdate();
    // this.partNo.focus();
    this.partNo.open();
  }
  setPartNo(e: any) {
    // this.workOrderForm.patchValue({
    //   partNo: e.partNumber
    // })
    this.setProductField(e);
  }
  setPartName(e: any) {
    // this.workOrderForm.patchValue({
    //   partName: e.partName
    // })
    this.setProductField(e);
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
    });
  }

  newWorkOrder() {
    this.newOrder = true
    this.showNewWorkOrderForm = true;
    this.selectedOrderId = '';
    this.cancelUpdate();
    this.workOrderForm.patchValue({ workOrderNumber: this.workOrders.length > 0 ? this.workOrders[this.workOrders.length - 1].workOrderNumber + 1 : 1 })

  }

  cancel() {
    this.showNewWorkOrderForm = false;
  }

  setSupplier(e: any) {
    this.workOrderForm.patchValue({
      serviceProviderName: e.accountName
    })
    this.getAllTransactions()
  }
  editWorkOrder(workOrder: any) {
    this.newOrder = false
    this.showNewWorkOrderForm = true;
    this.selectedOrderId = workOrder._id;
    this.partsData = workOrder.partsData;
    this.workOrderForm.patchValue({
      workOrderNumber: workOrder.workOrderNumber,
      serviceProviderName: workOrder.serviceProviderName,
      totalQuantity: workOrder.totalQuantity,
      totalAmount: workOrder.totalAmount,
      partNo: workOrder.partNo,
      partName: workOrder.partName,
      quantity: workOrder.quantity,
      unit: workOrder.unit,
      rate: workOrder.rate,
      comment: workOrder.comment,
      totalNetAmount: workOrder.totalAmount
    })
  }

  deleteWorkOrder(id: string) {
    this.workOrderService.deleteWorkOrder(id).subscribe(() => {
      this.getAllOrders();
    })
  }
  completeOrder(order: any) {
    order.status = 'Complete'
    this.workOrderService.updateWorkOrder(order._id, order).subscribe(res => {

      // this.printOrder()
      this.getAllOrders();
      // this.cancelUpdate();

      // this.showNewWorkOrderForm = false;
    })
  }

  saveWorkOrder() {
    const payload = {
      partsData: this.partsData,
      workOrderNumber: this.workOrderForm.value.workOrderNumber,
      serviceProviderName: this.workOrderForm.value.serviceProviderName.accountName,
      totalQuantity: this.workOrderForm.value.totalQuantity,
      totalAmount: this.workOrderForm.value.totalNetAmount,
      comment: this.workOrderForm.value.comment,
      status: this.workOrderForm.value.status,
      date: this.workOrderForm.value.date
    }
    if (this.newOrder) {
      this.workOrderService.saveWorkOrder(payload).subscribe((res: any) => {
        this.selectedOrderId = res._id
        // this.printOrder()
        this.cancelUpdate();
        this.getAllOrders();
        this.showNewWorkOrderForm = false;
      })
    } else {
      this.workOrderService.updateWorkOrder(this.selectedOrderId, payload).subscribe(res => {

        // this.printOrder()
        this.getAllOrders();
        this.cancelUpdate();

        this.showNewWorkOrderForm = false;
      })
    }

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

  addToWorkOrder() {

  }

  printOrder() {
    const data: any = []
    const categoriesWiseData: any = {}
    this.partsData.map((item: any, index: number) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.partNo)
      arr.push(item.partName)
      arr.push(item.unit)
      arr.push(item.quantity)
      arr.push(item.gst + '%')
      arr.push(item.rate)
      arr.push(item.netAmount ? item.netAmount.toFixed(2) : parseFloat(item.rate) * item.quantity)
      // arr.push(item.categoryId);
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
    doc.text("WORK ORDER", 100, 15, { align: 'center' })

    // doc.setFontSize(8);
    // doc.text("Order By: Vishwayoddha Shetkari Multitrade", 100, 2, { align: 'center' })
    // doc.setFontSize(7);
    // doc.text("Address: Katraj, Pune.", 100, 25, { align: 'center' })

    // doc.autoTable({ html: '#my-table' })
    // doc.text("Wishvayodha Multitrade", 14, 20);
    doc.setFontSize(10);
    // doc.setFontSize(8);
    doc.text("Supplier Name:", 14, 30)
    doc.text(this.workOrderForm.value.serviceProviderName.accountName ? this.workOrderForm.value.serviceProviderName.accountName : this.workOrderForm.value.serviceProviderName, 40, 30);

    doc.text("Work Order No:", 145, 30)
    doc.text(this.workOrderForm.value.workOrderNumber.toString(), 175, 30);

    doc.text("Order Date: ", 14, 35)
    doc.text(this.workOrderForm.value.date, 40, 35);

    doc.line(14, 40, 196, 40);
    doc.text("Order By: Vishwayoddha Shetkari Multitrade", 14, 45)
    // doc.setFontSize(7);
    doc.text("Address: Katraj, Pune.", 14, 50)

    // doc.text("Job Card No:", 14, 35);
    // doc.text(this.workOrderForm.value.jobCardNo, 35, 35);
    // doc.text("Bill Date:", 150, 35)
    // doc.setFont('', 'bold');
    // doc.text(this.workOrderForm.value.jobCardDate, 175, 35)
    // doc.line(14, 38, 196, 38);

    // doc.text("Vehicle Number:", 14, 45);
    // doc.text(this.workOrderForm.value.registrationNumber.vehicleNumber, 45, 45);
    // doc.text("Model Name:", 120, 45)
    // doc.text(this.workOrderForm.value.modelName, 145, 45)

    // doc.text("Mechanic Name:", 14, 50);
    // doc.text(this.workOrderForm.value?.mechanicName?.accountName, 45, 50);
    // doc.text("KM Covered:", 120, 50)
    // doc.text(this.workOrderForm.value.kmCovered.toString(), 145, 50)

    // doc.text("GST No:", 14, 55);
    // doc.text("Payment Mode:", 14, 55)
    // doc.text(this.workOrderForm.value.paymentMode, 45, 55)

    doc.line(14, 55, 196, 55);
    // TODO to get address use this
    // this.accounts[this.getAccountIndex(res.mechanicName)]

    // doc.line(14, 35, 196, 35);
    // doc.setFontSize(8);

    // doc.text("Bill No: " + this.workOrderForm.value.jobCardNo.toString(), 14, 40)
    // doc.text("Firm Name: Wishvayodha Multitrade", 14, 45)

    // doc.text("Date: " + this.workOrderForm.value.jobCardDate, 140, 40)
    // // doc.text("Firm Name: Wishvayodha Multitrade", 10, 40)
    // doc.text("Type: " + this.workOrderForm.value.paymentMode, 140, 45)
    // doc.line(14, 50, 196, 50);

    // doc.table(10, 60, this.generateData(10), this.headers, { fontSize: 7, });
    // 
    // const doc2 = new jsPDF();
    // if (this.workOrderForm.value.comment) {
    //   body.push(['', '', '', '', '', '', '', '']);
    //   body.push(['', 'Items Description: \n' + this.workOrderForm.value.comment, '', '', '', '', , '', '']);
    // }
    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Part No.",
        "Part Name",
        "Unit",
        "Quantity",
        "GST",
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
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.workOrderForm.value.totalNetAmount)), 14, tableHeight + 10)
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    // doc.text('In Word: RS: ***', 14, tableHeight + 10)
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.workOrderForm.value.totalNetAmount)), 14, tableHeight + 5)
    // doc.text('INR In Words: ' + this.inWords(parseInt(this.workOrderForm.value.totalNetAmount)), 14, tableHeight + 10)
    if (this.workOrderForm.value.comment) {
      doc.text('Remarks: \n' + this.workOrderForm.value.comment, 14, tableHeight + 15)
    }
    doc.text("Grand Total Amount:", 165, tableHeight + 15, { align: 'right' })
    doc.text(this.workOrderForm.value.totalNetAmount ? this.workOrderForm.value.totalNetAmount.toFixed(2) : '0', 195, tableHeight + 15, { align: 'right' })
    // doc.text("CGST Amount:", 150, tableHeight + 20, { align: 'right' })
    // const gst: number = parseFloat(this.workOrderForm.value.gstTotal) / 2;
    // doc.text(gst.toFixed(2), 180, tableHeight + 20, { align: 'right' })
    // doc.text("SGST Amount:", 150, tableHeight + 25, { align: 'right' })
    // doc.text(gst.toFixed(2), 180, tableHeight + 25, { align: 'right' })
    // doc.text("Total Discount:", 150, tableHeight + 30, { align: 'right' })
    // let discount = '0';
    // if (this.workOrderForm.value.tradeDiscount) {
    //   discount = '- ' + this.workOrderForm.value.tradeDiscount.toString()
    // }
    // doc.text(discount, 180, tableHeight + 30, { align: 'right' })
    // doc.line(14, tableHeight + 35, 196, tableHeight + 35);
    // doc.text("Net Amount:", 150, tableHeight + 40, { align: 'right' })
    // doc.text(this.workOrderForm.value.totalNetAmount, 180, tableHeight + 40, { align: 'right' })
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
