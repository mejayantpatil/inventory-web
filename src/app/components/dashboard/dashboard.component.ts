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
import { AgChartOptions } from 'ag-charts-community';
import { CategoryService } from 'src/app/services/category.service';

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
  public totalStockCost = 0;
  public totalConsumedCost = 0;
  public mostUsedProducts: any[] = []
  public options: AgChartOptions = {};
  public options1: AgChartOptions = {};
  public options2: AgChartOptions = {};
  public options3: AgChartOptions = {};
  public originalProducts: any = [];
  public categories: any = [];
  @ViewChild('toast') toast: any;
  constructor(private productService: ProductService,
    private router: Router,
    private cardService: CardService, private jobService: JobService,
    private supplyOrderService: SupplyOrderService,
    private workOrderService: WorkOrderService,
    private vehicleService: VehicleService,
    private transactionService: TransactionService, private categoriesService: CategoryService) {
  }

  ngOnInit() {
    this.getCategories()
    this.getAllTransactions();
    this.getAllOrders();
    this.getCards()
  }

  getCategories() {
    this.categoriesService.getCategorys().subscribe(res => {
      this.categories = res;
    })
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
      const val = vehicle.currentKM - (this.kmByBusNo[vehicle.vehicleNumber][1] ? this.kmByBusNo[vehicle.vehicleNumber][1] : 0)
      return val > 0 ? val : 0
    } else return 0

  }

  getServiceDetails(vehicle: Vehicle) {
    if (this.kmByBusNo[vehicle.vehicleNumber]) {
      this.kmByBusNo[vehicle.vehicleNumber].sort((a: number, b: number) => b - a);

      const diffence = vehicle.currentKM - (this.kmByBusNo[vehicle.vehicleNumber][1] ? this.kmByBusNo[vehicle.vehicleNumber][1] : 0)
      if (diffence < 21000 && diffence > 15000) {
        return 'Oil Change';
      } if (diffence < 70000 && diffence > 50000) {
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
      // TODO add here logic for update product order placed
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
      o.assemblesData = [];
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
      this.originalProducts = res;
      this.products = [];
      res.map((p: any) => {
        const qty = (p.quantity ? p.quantity : 0) + (this.stockPurchased[p.partNumber] ? this.stockPurchased[p.partNumber] : 0) - (this.stockConsumed[p.partNumber] ? this.stockConsumed[p.partNumber] : 0)
        console.log(p.orderPlaced, p.partNumber)
        if (qty <= 10 && !p.orderPlaced) {
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


      const array: any[] = [];
      let testArr: any[] = [];
      let testArr1: any[] = [];
      let testArr2: any[] = [];
      let pieArr: any = {};
      const cats = ['ENGINE',
        'CLUTCH SYSTEM',
        'TRANSMISSION',
        'PROPELLER SHAFT',
        'FRONT AXLE',
        'REAR AXLE',
        'FRONT WHEEL',
        'REAR WHEEL',
        'POWER STEERING',
        'BRAKE SYSTEM']
      const catIds = ['642c04a8cbc85cf3c84ec9f8',
        '642ada548bda6bde91e35077', '642ada998bda6bde91e3507a',
        '642adabc8bda6bde91e3507d', '642adadc8bda6bde91e35080',
        '642adb0c8bda6bde91e35083', '642adb1b8bda6bde91e35086',
        '642adb628bda6bde91e35089', '642adb7b8bda6bde91e3508c',
        '642ade468bda6bde91e350a5', '642adecc8bda6bde91e350ab',
        '642adc368bda6bde91e35098']
      // ['POWER STEERING', 'ENGINE',
      // 'CLUTCH SYSTEM',
      // 'TRANSMISSION',
      // 'PROPELLER SHAFT',
      // 'FRONT AXLE',
      // 'REAR AXLE',
      // 'FRONT SUSPENSSION',
      // 'REAR SUSPENSSION',
      // 'FRONT WHEEL',
      // 'REAR WHEEL',
      //   'BRAKE SYSTEM']
      const cats1 = ['FUEL SYSTEM',
        'TURBO SYSTEM',
        'COOLING SYSTEM',
        'EXHAUST SYSTEM',
        'LUBRCATION SYSTEM',
        'IGNITION SYSTEM',
        'ELECTRICAL SYSTEM']
      const pie1 = ['80W90',
        '85W140',
        'DOT 4',
        'ATF DXIII',
        '4320-000126',
        '4320-000127',
        '19202122',
        '15W40']

      const pie4 = ['2930-883240',
        // 'PD600616',
        'F3P024351',
        'F3V04000',
        '2930-006020',
        '2930-883280',
        // 'PD600613',
        '2930-004902',
        '2930-004901',
        '2930-251580',
        '2930-095000',
        'M251580',
        '2930-001900']

      let cat: any = {};
      Object.values(this.stockConsumed).map((p: any) => {
        array.push(parseInt(p))
      })
      array.sort((a, b) => b - a);
      let count = 0;
      Object.keys(this.stockConsumed).map(p => {
        const pp = this.originalProducts.find((pr: any) => pr?.partNumber === p)
        const rate = pp?.newRate ? pp?.newRate : pp?.saleRate
        const amount = rate * this.stockConsumed[p];
        if (pp?.category) {
          cat[pp?.category] ? cat[pp?.category].push(amount) : cat[pp?.category] = [];
        }
        if (pie4.includes(pp?.partNumber)) {
          let obj: any = {};
          obj.label = p + ' ' + (pp?.partName ? pp?.partName : '');
          obj.value = this.stockConsumed[p] * rate// + '%';
          testArr.push(obj);
          // count++;
        }
      });
      array.map(a => {

        Object.keys(this.stockConsumed).map(p => {
          const pp = this.originalProducts.find((pr: any) => pr?.partNumber === p)
          const rate = pp?.newRate ? pp?.newRate : pp?.saleRate
          // cat[pp?.category] ? cat[pp?.category].push(pp?.partNumber) : cat[pp?.category] = [];

          // console.log(pp?.partNumber, cat)

          // console.log(this.stockConsumed[p], pp?.saleRate, pp?.newRate)

          if (a === this.stockConsumed[p] && pie4.includes(pp?.partNumber)) {
            let obj: any = {};
            obj.label = p + ' ' + (pp?.partName ? pp?.partName : '');
            obj.value = this.stockConsumed[p] * rate// + '%';
            // testArr.push(obj);
            // count++;
          }
          if (pie1.includes(p)) {
            pieArr[p + ' ' + (pp?.partName ? pp?.partName : '')] = this.stockConsumed[p]
          }

          // if (a === this.stockConsumed[p] && pie1.includes(p)) {
          //   let obj: any = {};
          //   obj.label = p + ' ' + (pp?.partName ? pp?.partName : '');
          //   obj.value = this.stockConsumed[p]// + '%';
          //   testArr.push(obj);
          //   count++;
          // }
        })

      })
      // console.log(testArr);

      let testArr3: any = []
      Object.keys(pieArr).map(p => {
        let obj: any = {};
        obj.label = p;
        obj.value = pieArr[p]// + '%';
        testArr3.push(obj);
      });
      let catArr: any = [];
      let count1 = 0;
      Object.keys(cat).map(c => {
        const cn = this.categories.find((ct: any) => ct._id === c)

        catArr[cn?.categoryName] = cat[c] ? cat[c].length : 0;
        // console.log(c, cat[c] ? cat[c].reduce((a: any, b: any) => a + b) : 0)
        // if (count1 < 10) {
        let obj: any = {};
        if (cats.includes(cn?.categoryName)) {
          obj.label = cn?.categoryName;
          obj.value = cat[c].length > 0 ? cat[c].reduce((a: any, b: any) => a + b) : 0;
          testArr1.push(obj);
          count1++;
        }

        // }
        obj = {};
        if (cn?.categoryName && cats1.includes(cn?.categoryName)) {
          obj.label = cn?.categoryName;
          obj.value = cat[c].length > 0 ? cat[c].reduce((a: any, b: any) => a + b) : 0;
          testArr2.push(obj);
          // count1++;
        }

      })
      // console.log(catArr);
      this.mostUsedProducts = testArr;

      this.options = {
        legend: { enabled: false },
        data: testArr,
        series: [
          {
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            sectorLabelKey: 'value',
            sectorLabel: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        ],

      };

      this.options1 = {
        legend: { enabled: false },
        data: testArr1,
        series: [
          {
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            sectorLabelKey: 'value',
            sectorLabel: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        ],

      };

      this.options2 = {
        legend: { enabled: false },
        data: testArr2,
        series: [
          {
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            sectorLabelKey: 'value',
            sectorLabel: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        ],
      };

      this.options3 = {
        legend: { enabled: false },
        data: testArr3,
        series: [
          {
            type: 'pie',
            angleKey: 'value',
            calloutLabelKey: 'label',
            sectorLabelKey: 'value',
            sectorLabel: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        ],
      };

    })
  }

  getAllTransactions() {
    this.transactionService.getTransactions().subscribe((res: any) => {
      res.map((t: any) => {
        this.totalStockCost = this.totalStockCost + parseFloat(t.netAmount)
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
          // console.log(c.jobCardDate, c.billDate)
          this.totalConsumedCost = this.totalConsumedCost + parseFloat(c.netAmount)
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
