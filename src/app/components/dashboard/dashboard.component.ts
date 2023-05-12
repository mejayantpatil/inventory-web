import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { CardService } from 'src/app/services/cards.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SupplyOrderService } from 'src/app/services/supplyOrderService';
import { TransactionService } from 'src/app/services/transactions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  public products: any = [];
  public stockPurchased: any = {}
  public supplierNameObj: any = {}
  public stockConsumed: any = {}
  public orders: any = [];
  public selectAll: boolean = false
  public jobIDandCardMap: any = {};
  public activeCards: any = []
  constructor(private productService: ProductService,
    private router: Router,
    private cardService: CardService, private jobService: JobService,
    private supplyOrderService: SupplyOrderService,
    private transactionService: TransactionService) {

  }

  ngOnInit() {
    this.getAllTransactions();
    this.getAllOrders();
    this.getCards()
  }

  getAllOrders() {
    this.supplyOrderService.getSupplyOrders().subscribe(res => {
      this.orders = res;
    })
  }

  getCards() {
    this.cardService.getCards().subscribe((res: any) => {
      // this.activeCards = res;
      this.jobIDandCardMap = JSON.parse(res.jobIDandCardMap || '{}');// ? res.jobIDandCardMap : {});
      this.activeCards = Object.keys(this.jobIDandCardMap)
      // this.getAllJobs();
      // this.loadAllCards()
    })
  }

  openJobCard(job: any) {
    this.router.navigate(['job-card', this.jobIDandCardMap[job]])
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
      supplierObj[s].map((p: any) => {
        qty = qty + p.quantity
      })
      orders.push({
        partsData: supplierObj[s],
        supplyOrderNumber: this.orders.length + 1,
        supplierName: s,
        totalQuantity: qty,
        totalAmount: 0,
        comment: '',
        status: 'Pending',
        date: new Date().toISOString().substring(0, 10)
      })
    });
    this.saveSupplyOrder(orders);
  }

  saveSupplyOrder(orders: any[]) {
    let count = this.orders.length + 1;
    orders.map(async (o) => {
      o.supplyOrderNumber = count;
      count++;
      await this.supplyOrderService.saveSupplyOrder(o).subscribe(res => {
        console.log('ok')
      })
    })
    this.unCheckAll();
    console.log('done')
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

  getProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = [];
      res.map((p: any) => {
        const qty = (p.quantity ? p.quantity : 0) + (this.stockPurchased[p.partNumber] ? this.stockPurchased[p.partNumber] : 0) - (this.stockConsumed[p.partNumber] ? this.stockConsumed[p.partNumber] : 0)
        if (qty <= 10) {
          this.products.push({
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
      });

    })
  }

  getAllTransactions() {
    this.transactionService.getTransactions().subscribe((res: any) => {
      res.map((t: any) => {
        t.data.map((i: any) => {
          this.stockPurchased[i.partNo] = parseInt(this.stockPurchased[i.partNo] ? this.stockPurchased[i.partNo] : '0') + parseInt(i.quantity);
          // this.stockPuchasedValues[i.partNo] = i.newRate ? i.newRate : 0
          this.supplierNameObj[i.partNo] = { gst: i.cgstPercentage + i.sgstPercentage, supplierName: t.supplierName }
        })
      });
      this.getAllJobs();
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

      });
      this.getProducts();
    })
  }
}
