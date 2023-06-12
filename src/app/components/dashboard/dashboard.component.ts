import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { Vehicle } from 'src/app/models/vehicle';
import { CardService } from 'src/app/services/cards.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SupplyOrderService } from 'src/app/services/supplyOrderService';
import { TransactionService } from 'src/app/services/transactions.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { WorkOrderService } from 'src/app/services/work-order.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  public products: any = [];
  public repairedProducts: any = [];
  public stockPurchased: any = {}
  public supplierNameObj: any = {}
  public stockConsumed: any = {}
  public orders: any = [];
  public workOrders: any = [];
  public selectAll: boolean = false
  public selectAllRepaired: boolean = false;
  public jobIDandCardMap: any = {};
  public activeCards: any = [];
  public vehicles: any = [];
  public kmByBusNo: any = {};
  @ViewChild('toast') toast: any;

  constructor(private productService: ProductService,
    private router: Router,
    private cardService: CardService, private jobService: JobService,
    private supplyOrderService: SupplyOrderService,
    private workOrderService: WorkOrderService,
    private vehicleService: VehicleService,
    private transactionService: TransactionService) {

  }

  ngOnInit() {
    this.getAllTransactions();
    this.getAllOrders();
    this.getCards()
  }

  getVehicles() {
    this.vehicleService.getVehicles().subscribe(res => {
      this.vehicles = res;
    })
  }
  isEmptyObject(obj: any) {
    return (obj && (Object.keys(obj).length === 0));
  }

  getKM(vehicle: Vehicle) {
    if (this.kmByBusNo[vehicle.vehicleNumber]) {
      this.kmByBusNo[vehicle.vehicleNumber].sort((a: number, b: number) => b - a);
      // console.log(vehicle.vehicleNumber, this.kmByBusNo[vehicle.vehicleNumber])

      return vehicle.currentKM - (this.kmByBusNo[vehicle.vehicleNumber][1] ? this.kmByBusNo[vehicle.vehicleNumber][1] : 0)
    } else return 0

  }

  getServiceDetails(vehicle: Vehicle) {
    if (this.kmByBusNo[vehicle.vehicleNumber]) {
      this.kmByBusNo[vehicle.vehicleNumber].sort((a: number, b: number) => b - a);

      const diffence = vehicle.currentKM - (this.kmByBusNo[vehicle.vehicleNumber][1] ? this.kmByBusNo[vehicle.vehicleNumber][1] : 0)
      if (diffence < 21000 && diffence > 18000) {
        return 'Oil Change';
      } if (diffence < 61000 && diffence > 58000) {
        return 'Total Service';
      } else return ''
    } else return ''
  }

  checkVehicleKM(vehicle: Vehicle) {
    const current = vehicle.currentKM ? vehicle.currentKM : 0
    const last = this.kmByBusNo[vehicle.vehicleNumber] ? this.kmByBusNo[vehicle.vehicleNumber] : 0
    return current - last > 19000 && current - last < 21000;
  }

  getAllOrders() {
    this.supplyOrderService.getSupplyOrders().subscribe(res => {
      this.orders = res;
    })

    this.workOrderService.getWorkOrders().subscribe(res => {
      this.workOrders = res;
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

  addToWorkOrder() {
    let orders: any = []
    let supplierObj: any = {}
    this.repairedProducts.map((p: any) => {
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
        total = total + p.netAmount
      })
      orders.push({
        partsData: supplierObj[s],
        workOrderNumber: this.workOrders.length + 1,
        serviceProviderName: s,
        totalQuantity: qty,
        totalAmount: total,
        comment: '',
        status: 'Pending',
        date: new Date().toISOString().substring(0, 10)
      })
    });
    this.saveWorkOrder(orders);
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
        supplyOrderNumber: this.orders.length + 1,
        supplierName: s,
        totalQuantity: qty,
        totalAmount: total,
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
    this.showToast();
  }

  saveWorkOrder(orders: any[]) {
    let count = this.orders.length + 1;
    orders.map(async (o) => {
      o.workOrderNumber = count;
      count++;
      await this.workOrderService.saveWorkOrder(o).subscribe(res => {
        console.log('ok')
      })
    })
    this.unCheckAllRepaired();
    console.log('done')
    this.showToast();
  }

  checkAll() {
    this.products.map((p: any) => {
      p.checked = !p.checked;
    })
  }

  checkAllRepaired() {
    this.repairedProducts.map((p: any) => {
      p.checked = !p.checked;
    })
  }

  unCheckAll() {
    this.selectAll = false;
    this.products.map((p: any) => {
      p.checked = false;
    })
  }

  unCheckAllRepaired() {
    this.selectAllRepaired = false;
    this.repairedProducts.map((p: any) => {
      p.checked = false;
    })
  }

  getProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = [];
      res.map((p: any) => {
        const qty = (p.quantity ? p.quantity : 0) + (this.stockPurchased[p.partNumber] ? this.stockPurchased[p.partNumber] : 0) - (this.stockConsumed[p.partNumber] ? this.stockConsumed[p.partNumber] : 0)
        if (qty <= 10) {
          if (p.partName.toLowerCase().includes('repaired')) {
            this.repairedProducts.push({
              checked: false,
              partName: p.partName,
              partNumber: p.partNumber,
              quantity: qty,
              rate: p.newRate ? p.newRate : p.saleRate,
              unit: p.unit,
              gst: this.supplierNameObj[p.partNumber] ? this.supplierNameObj[p.partNumber].gst : 0,
              supplierName: this.supplierNameObj[p.partNumber] ? this.supplierNameObj[p.partNumber].supplierName : ''
            })
          } else {
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
        if (t.cardData[0]) {
          // console.log(t.cardData[0].registrationNumber, t.cardData[0].kmCovered)
          if (this.kmByBusNo[t.cardData[0].registrationNumber]) {
            this.kmByBusNo[t.cardData[0].registrationNumber].push(t.cardData[0].kmCovered)

            // const km = this.kmByBusNo[t.cardData[0].registrationNumber] < t.cardData[0].kmCovered ?
            //   t.cardData[0].kmCovered : this.kmByBusNo[t.cardData[0].registrationNumber];
            // this.kmByBusNo[t.cardData[0].registrationNumber] = km ? km : 0;
            // this.kmByBusNo[t.cardData[0].registrationNumber].sort()
          } else {
            this.kmByBusNo[t.cardData[0].registrationNumber] = [t.cardData[0].kmCovered];

          }
        }
      });
      // console.log(this.kmByBusNo);
      this.getVehicles();
      this.getProducts();
    })
  }

  showToast() {
    // TODO toat
    this.toast.nativeElement.setAttribute('class', 'toast show')
    setTimeout(() => {
      this.toast.nativeElement.setAttribute('class', 'toast hide')
    }, 2000)
  }
}
