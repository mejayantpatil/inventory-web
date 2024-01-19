import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import { Account } from 'src/app/models/account';
import { Group } from 'src/app/models/group';
import { Product } from 'src/app/models/product';
import { Job, SpareParts } from 'src/app/models/jobs';
import { AccountService } from 'src/app/services/accounts.service';
import { CategoryService } from 'src/app/services/category.service';
import { GroupService } from 'src/app/services/groups.service';
import { ProductService } from 'src/app/services/products.service';
import { JobService } from 'src/app/services/jobs.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { Vehicle } from 'src/app/models/vehicle';
import { TransactionService } from 'src/app/services/transactions.service';
import { CardService } from 'src/app/services/cards.service';
import { SupplyOrderService } from 'src/app/services/supplyOrderService';
import { WorkOrderService } from 'src/app/services/work-order.service';
import { companyName } from 'src/app/constants';

@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent {

  public spareParts: SpareParts[] = [];
  public jobCardForm: FormGroup;
  public modes: string[] = [];
  public jobCardNumber: number = 0;
  public products: Product[] = [];
  public accounts: Account[] = [];
  public vehicles: Vehicle[] = [];
  public selectedQuantity: any;
  public groups: Group[] = [];
  public supplierGroupID: string = '';
  public workerID: string = '';
  public job: any;
  public test: any;
  public selectedProduct: any;
  public selectedIndex = -1;
  public jobs: Job[] = [];
  public productForm: FormGroup;
  public categorys: any[] = [];
  public categroysObj: any = {};
  public cardData: any[] = []
  public currentJob: number = 0;
  public cards: number[] = []
  public mechanics: any[] = [];
  public transactions: any[] = [];
  public stockPurchased: any = {}
  public openingStock: any = {}
  public stockPuchasedValues: any = {}
  public stockConsumed: any = {}
  public jobIDandCardMap: any = {}
  public loadedAllJob = false;
  public cardsStatus: any = {};
  public activeCards: any = {}
  public prodcutSupplier: any = {}
  public prodcutProvider: any = {}
  public orders: any = []
  public workOrders: any = [];
  @ViewChild('closebutton') closebutton: any;
  @ViewChild('toast') toast: any;
  @ViewChild('jobCardDateElement') jobCardDateElement: any;
  @ViewChild('partNo') partNo: any;
  @ViewChild('vehicleNumber') vehicleNumber: any;

  constructor(private jobService: JobService,
    private activatedRoute: ActivatedRoute,
    private accountSerivce: AccountService,
    private productService: ProductService,
    private router: Router,
    private vehicleService: VehicleService,
    private productSerivce: ProductService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private cardService: CardService,
    private supplyOrderService: SupplyOrderService,
    private workOrderService: WorkOrderService,
    private groupService: GroupService) {


    this.activatedRoute.params.subscribe((params: any) => {
      this.jobCardNumber = params.jobCardNumber;
    })
    this.job = {};
    this.modes = ['Cash', 'Credit']
    this.jobCardForm = new FormGroup({
      jobCardNo: new FormControl(this.jobCardNumber),
      paymentMode: new FormControl(''),
      recordNo: new FormControl(''),
      mechanicName: new FormControl(''),
      chasisNumber: new FormControl(''),
      engineNumber: new FormControl(''),
      registrationNumber: new FormControl('', Validators.required),
      modelName: new FormControl(''),
      kmCovered: new FormControl('', Validators.required),
      jobCardDate: new FormControl(new Date().toISOString().substring(0, 10)),
      billDate: new FormControl(new Date().toISOString().substring(0, 10)),
      partNo: new FormControl(''),
      partName: new FormControl(''),
      rate: new FormControl(''),
      unit: new FormControl(''),
      quantity: new FormControl(''),
      oilChange: new FormControl('No'),
      service: new FormControl('No'),
      problem: new FormControl('Service and General Maintenance'),
      netAmount: new FormControl(''),
      totalNetAmount: new FormControl(''),
      comment: new FormControl(''),
      status: new FormControl('Running')
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
    console.log('disable')
    // this.productForm.disable();
    // this.jobCardForm.disable();
  }

  ngOnInit() {
    const jobIDandCardMap: any = sessionStorage.getItem('jobIDandCardMap');
    this.jobIDandCardMap = JSON.parse(jobIDandCardMap) || {}
    this.getAllProducts();
    this.getGroups();
    // this.getAllJobs();
    this.getAllCategories();
    // this.getVehicles();
    this.getAllTransactions();
    this.getActiveCards();

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

  loadAllCards() {
    const totalCards = 44;
    this.cards = []
    for (let i = 1; i <= totalCards; i++) {
      this.cards.push(i);
    }
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
    this.stockPurchased = {}
    this.transactionService.getTransactions().subscribe((res: any) => {
      this.transactions = res;
      res.map((t: any) => {
        t.data.map((i: any) => {
          this.stockPurchased[i.partNo] = parseInt(this.stockPurchased[i.partNo] ? this.stockPurchased[i.partNo] : '0') + parseInt(i.quantity);
          // this.stockPuchasedValues[i.partNo] = i.newRate ? i.newRate : 0
          this.prodcutSupplier[i.partNo] = t;

        })
      });
    })
  }

  getAllJobs() {
    this.loadedAllJob = false;
    this.cardsStatus = [];
    this.stockConsumed = {}
    this.jobService.getJobs().subscribe((res: any) => {
      this.jobs = res;
      this.loadedAllJob = true;
      res.map((t: any) => {
        if (t.cardData[0] && this.jobIDandCardMap[t.cardData[0].recordNo]) {
          this.cardsStatus[t.cardData[0].recordNo] = { status: t.cardData[0].status }
        }
        t.cardData.map((c: any) => {
          c?.spareParts && c?.spareParts.map((i: any) => {
            // if (t.status === 'Complete') {
            this.stockConsumed[i.partNo] = (this.stockConsumed[i.partNo] ? this.stockConsumed[i.partNo] : 0) + i.quantity;
            // this.totalConsumedQty = this.totalConsumedQty + i.quantity;
            // }
          })
        })

      });
    })
  }

  getAllProducts() {
    this.productService.getProducts().subscribe((res: any) => {
      this.products = res;
      this.products.map(p => {
        this.openingStock[p.partNumber] = p.quantity;
      })
      // this.products = this.products.filter((p: Product) => p.category === this.supplierGroupID);
    })
  }

  getVehicles() {
    this.vehicleService.getVehicles().subscribe((res: any) => {
      this.vehicles = res;
      if (this.jobCardNumber) {
        this.getJob(this.jobCardNumber);
      }
      // this.products = this.products.filter((p: Product) => p.category === this.supplierGroupID);
    })
  }

  getGroups() {
    this.groupService.getGroups().subscribe((res: any) => {
      // this.groups = res;
      res.map((g: any) => {
        if (g.groupName.toLowerCase() === 'supplier') {
          this.supplierGroupID = g._id;

        } else if (g.groupName.toLowerCase() === 'worker') {
          this.workerID = g._id;
        }
      })
      this.getAllAccounts();
    })
  }
  updateVehicle() {
    let vehicle = this.vehicles.find(v => v.vehicleNumber === this.jobCardForm.value.registrationNumber?.vehicleNumber)
    if (vehicle) {
      vehicle.currentKM = this.jobCardForm.value.kmCovered;
      vehicle.oilChange = this.jobCardForm.value.oilChange
      vehicle.service = this.jobCardForm.value.service
      this.vehicleService.updateVehicle(vehicle._id || '', vehicle).subscribe(res => { })
    }
  }

  getActiveCards() {
    this.cardService.getCards().subscribe((res: any) => {
      this.activeCards = res;
      this.jobIDandCardMap = JSON.parse(res.jobIDandCardMap || '{}');// ? res.jobIDandCardMap : {});
      this.getAllJobs();
      this.loadAllCards()
    })
  }

  setMachanic(e: any) {
    this.jobCardForm.value.mechanicName = this.accounts[e];
  }

  getAllAccounts() {
    // this.spinner.showSpinner();
    this.accountSerivce.getAccounts().subscribe((res: any) => {
      // this.spinner.hideSpinner();
      this.mechanics = res.filter((a: any) => a.groupName === this.workerID)
      this.accounts = res;
      this.accounts = this.accounts.filter((a: Account) => a.groupName === this.supplierGroupID);
      if (this.jobCardForm.value.mechanicName) {
        this.setMachanic(this.accounts[this.mechanics.find(m => m.accountName === this.jobCardForm.value.mechanicName)]);
      }
      this.getVehicles();
    });
  }

  getAccountIndex(accountName: string) {
    return this.accounts.findIndex(a => a.accountName === accountName);
  }

  getMechanicIndex(mechanicName: string) {
    return this.mechanics.findIndex(m => {
      return m.accountName === mechanicName
    });
  }

  getProductIndex(partNo: string) {
    return this.products.findIndex(a => a.partNumber === partNo);
  }


  getVehicleIndex(number: string) {
    return this.vehicles.findIndex(v => v?.vehicleNumber === number)
  }

  getAvailableQuantity(product: Product) {
    if (product.partNumber) {
      // console.log(this.openingStock[product.partNumber], this.stockPurchased[product.partNumber], this.stockConsumed[product.partNumber])
      const opening = this.openingStock[product.partNumber] ? this.openingStock[product.partNumber] : 0;
      const purched = this.stockPurchased[product.partNumber] ? this.stockPurchased[product.partNumber] : 0;
      const consumed = this.stockConsumed[product.partNumber] ? this.stockConsumed[product.partNumber] : 0;
      const available = opening + purched;
      return available - consumed
    } else return 0
  }

  getJob(jobCardNumber: number) {
    this.jobService.getJob(jobCardNumber.toString()).subscribe((res: any) => {
      if (!res) return;
      this.job = res;
      this.cardData = res.cardData;
      this.spareParts = [];//res.spareParts;
      this.jobCardForm = new FormGroup({
        jobCardNo: new FormControl(this.jobCardNumber),
        paymentMode: new FormControl(''),
        recordNo: new FormControl(''),
        mechanicName: new FormControl(''),
        registrationNumber: new FormControl('', Validators.required),
        billDate: new FormControl(new Date().toISOString().substring(0, 10)),
        jobCardDate: new FormControl(new Date().toISOString().substring(0, 10)),
        modelName: new FormControl(''),
        chasisNumber: new FormControl(''),
        engineNumber: new FormControl(''),
        kmCovered: new FormControl('', Validators.required),
        oilChange: new FormControl('No'),
        service: new FormControl('No'),
        problem: new FormControl('Service and General Maintenance'),
        partNo: new FormControl(''),
        partName: new FormControl(''),
        rate: new FormControl(''),
        unit: new FormControl(''),
        quantity: new FormControl(''),
        netAmount: new FormControl(''),
        totalNetAmount: new FormControl(''),
        comment: new FormControl(''),
        status: new FormControl('Running')

        // paymentMode: new FormControl(res.paymentMode),
        // recordNo: new FormControl(res.recordNo),
        // mechanicName: new FormControl(res.mechanicName),
        // registrationNumber: new FormControl(this.vehicles[this.getVehicleIndex(res.registrationNumber)]),
        // billDate: new FormControl(res.billDate ? res.billDate : new Date().toISOString().substring(0, 10)),
        // jobCardDate: new FormControl(res.jobCardDate ? res.jobCardDate : new Date().toISOString().substring(0, 10)),
        // modelName: new FormControl(res.modelName),
        // chasisNumber: new FormControl(res.chasisNumber),
        // engineNumber: new FormControl(res.engineNumber),
        // kmCovered: new FormControl(res.kmCovered),
        // oilChange: new FormControl(res.oilChange),
        // problem: new FormControl(res.problem),
        // partNo: new FormControl('', Validators.required),
        // partName: new FormControl('', Validators.required),
        // rate: new FormControl('', Validators.required),
        // unit: new FormControl(res.unit),
        // quantity: new FormControl('', Validators.required),
        // netAmount: new FormControl(''),
        // totalNetAmount: new FormControl(res.netAmount.toFixed(2)),
        // comment: new FormControl(res.comment),
        // status: new FormControl()
      })
      this.setJob(res.cardData[0]?.recordNo)
      // setTimeout(() => {
      //   this.jobCardForm.patchValue({
      //     mechanicName: this.accounts[this.getAccountIndex(res.mechanicName)]
      //   })
      // }, 100)

    })
  }
  setVehicle(e: any) {

    // if vehicle number available in job cards then dont set
    let isJobRunning = false;
    let runningID = '';
    let runningJobCardNo = '';
    this.jobs.map(j => {
      if (j.cardData[0]?.registrationNumber === e.vehicleNumber && j.cardData[0]?.status === 'Running') {
        // get card no from jobCardNo
        Object.keys(this.jobIDandCardMap).map(i => {
          if (i && this.jobIDandCardMap[i].toString() === j.jobCardNo) {
            runningID = i;
            runningJobCardNo = j.jobCardNo;
            alert('This bus number is already in Running in Card No: ' + i)
            isJobRunning = true;
          }
        })
      }
    });

    if (isJobRunning && runningID && runningJobCardNo) {
      console.log(isJobRunning, runningID, runningJobCardNo)
      if (confirm('Do you want open Card No: ' + runningID)) {
        this.router.navigate(['job-card', runningJobCardNo])
        if (this.jobCardNumber) {
          setTimeout(() => {
            window.location.reload()
          }, 0)

        }
      } else {
        this.vehicleNumber.query = ''
      }
      return;
    }

    this.jobCardForm.patchValue({
      registrationNumber: e.vehicleNumber,
      modelName: e.vehicleType,
      kmCovered: ''// e.currentKM
    })
  }

  setPartNo(e: any) {
    // this.jobCardForm.patchValue({
    //   partNo: e.partNumber
    // })
    this.setProductField(e);
  }

  setPartName(e: any) {
    // this.jobCardForm.patchValue({
    //   partName: e.partName
    // })
    this.setProductField(e);
  }

  saveCard() {
    if (this.activeCards._id) {
      this.cardService.updateCard(this.activeCards._id, { jobIDandCardMap: JSON.stringify(this.jobIDandCardMap) }).subscribe(res => {
        this.getActiveCards()
      })
    } else {
      this.cardService.saveCard({ jobIDandCardMap: JSON.stringify(this.jobIDandCardMap) }).subscribe(res => {
        this.getActiveCards()
      })
    }
    this.updateVehicle();
  }

  getCard(recordNo: number) {
    // todo  check with all jobs if id is matching
    // let obj = { status: '' };
    // this.jobs.map((j: any) => {
    //   if (this.jobIDandCardMap[recordNo] === j.jobCardNo) {
    //     obj = j.cardData[0] ? j.cardData[0] : { status: '' };
    //   }
    // })
    return this.cardsStatus[recordNo];
    // return this.cardData.find(c => c.recordNo === recordNo)
  }

  saveJob() {
    this.cardData = []
    // const cardIndex = 0;//this.cardData.findIndex(c => c.recordNo === this.jobCardForm.value.recordNo)
    // if (this.cardData[cardIndex]) {
    //   this.cardData[cardIndex] = {
    //     paymentMode: this.jobCardForm.value.paymentMode,
    //     recordNo: this.jobCardForm.value.recordNo,
    //     mechanicName: this.jobCardForm.value.mechanicName?.accountName,
    //     jobCardDate: this.jobCardForm.value.jobCardDate,
    //     chasisNumber: this.jobCardForm.value.chasisNumber,
    //     engineNumber: this.jobCardForm.value.engineNumber,
    //     registrationNumber: this.jobCardForm.value.registrationNumber.vehicleNumber,
    //     modelName: this.jobCardForm.value.modelName,
    //     kmCovered: this.jobCardForm.value.kmCovered,
    //     billDate: this.jobCardForm.value.billDate,
    //     oilChange: this.jobCardForm.value.oilChange,
    //     problem: this.jobCardForm.value.problem,
    //     netAmount: this.jobCardForm.value.totalNetAmount,
    //     comment: this.jobCardForm.value.comment,
    //     status: this.jobCardForm.value.status,
    //     spareParts: this.spareParts
    //   }
    // } else {
    this.cardData[0] = {
      paymentMode: this.jobCardForm.value.paymentMode,
      recordNo: this.jobCardForm.value.recordNo,
      mechanicName: this.jobCardForm.value.mechanicName?.accountName,
      jobCardDate: this.jobCardForm.value.jobCardDate,
      chasisNumber: this.jobCardForm.value.chasisNumber,
      engineNumber: this.jobCardForm.value.engineNumber,
      registrationNumber: this.jobCardForm.value.registrationNumber.vehicleNumber,
      modelName: this.jobCardForm.value.modelName,
      kmCovered: this.jobCardForm.value.kmCovered,
      billDate: this.jobCardForm.value.billDate,
      oilChange: this.jobCardForm.value.oilChange,
      service: this.jobCardForm.value.service,
      problem: this.jobCardForm.value.problem,
      netAmount: this.jobCardForm.value.totalNetAmount,
      comment: this.jobCardForm.value.comment,
      status: this.jobCardForm.value.status,
      spareParts: this.spareParts
    }
    // }

    if (this.jobCardForm.value.recordNo && this.spareParts.length > 0 && this.jobCardForm.value.totalNetAmount) {
      const payload: Job = {
        jobCardNo: this.jobCardForm.value.jobCardNo,
        cardData: this.cardData

      }
      this.jobIDandCardMap[this.jobCardForm.value.recordNo] = this.jobCardNumber
      // this.jobIDandCardMap[this.jobCardForm.value.recordNo] = this.jobCardNumber + '_' + this.jobCardForm.value.registrationNumber.vehicleNumber
      // if (this.jobIDandCardMap._id) {
      //   this.cardService.updateCard(this.jobIDandCardMap._id, this.jobIDandCardMap).subscribe(res => {

      //   })
      // } else {
      //   this.cardService.saveCard(this.jobIDandCardMap).subscribe(res => {

      //   })
      // }
      // sessionStorage.setItem('jobIDandCardMap', JSON.stringify(this.jobIDandCardMap));

      if (this.jobIDandCardMap[this.jobCardForm.value.recordNo] && this.job.jobCardNo === this.jobCardForm.value.jobCardNo.toString()) {
        if (this.jobCardForm.value.status === 'Complete') {
          delete this.jobIDandCardMap[this.jobCardForm.value.recordNo]
        }
        this.jobService.updateJob(this.job._id, payload).subscribe(res => {
          // clear form

          this.cardData = [];
          this.currentJob = 0;
          this.toast.nativeElement.setAttribute('class', 'toast show')
          setTimeout(() => {
            this.toast.nativeElement.setAttribute('class', 'toast hide')
          }, 2000)
          this.saveCard()
          // this.reset()
          this.spareParts = [];
        })
      } else {
        this.jobService.saveJob(payload).subscribe(res => {
          if (this.jobCardForm.value.status === 'Complete') {
            delete this.jobIDandCardMap[this.jobCardForm.value.recordNo]

          }
          this.cardData = [];
          this.getJob(this.jobCardNumber);
          this.getAllJobs()
          this.toast.nativeElement.setAttribute('class', 'toast show')
          setTimeout(() => {
            this.toast.nativeElement.setAttribute('class', 'toast hide')
          }, 2000)
          this.saveCard()
          this.spareParts = [];
        })
      }


      // this.jobService.updateJob(this.job._id, payload).subscribe(res => {
      // this.jobService.saveJob(payload).subscribe(res => {
      // this.router.navigate(['jobs'])
      // if (this.jobCardForm.value.status === 'Complete') {
      // this.spareParts.map(async p => {
      //   const product: any = this.products[this.getProductIndex(p.partNo)];
      //   // product.saleRate = p.rate;
      //   // product.quantity = parseInt(product.quantity) - p.quantity;
      //   // product.consumedQuantity = p.quantity;
      //   product.unit = p.unit
      //   await this.productSerivce.updateProduct(product._id, product).subscribe(() => {
      //     console.log('product updated')
      //   })
      // })
      // this.getAllJobs()
      // }

      // TODO toat
      // this.toast.nativeElement.setAttribute('class', 'toast show')
      // setTimeout(() => {
      //   this.toast.nativeElement.setAttribute('class', 'toast hide')
      // }, 2000)
      // alert('Saved Successfully.')
      // })

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
    this.jobCardForm.patchValue({
      partNo: index > -1 ? this.products[index] : '',
      partName: index > -1 ? this.products[index] : '',
      quantity: 0,
      unit: this.selectedProduct.unit,
      rate: this.selectedProduct?.newRate ? this.selectedProduct?.newRate : this.selectedProduct?.saleRate
    })
    this.setAmount();
    this.supplyOrderService.getSupplyOrders().subscribe(res => {
      this.orders = res;
    })
    this.workOrderService.getWorkOrders().subscribe(res => {
      this.workOrders = res;
    })
  }

  setDiscount() {
    if (this.jobCardForm.value.discountPercentage > 0) {
      const originalPrice = this.jobCardForm.value.rate * this.jobCardForm.value.quantity;
      const discount = (originalPrice / 100) * this.jobCardForm.value.discountPercentage;
      this.jobCardForm.patchValue({ discount: discount })
    } else {
      this.jobCardForm.patchValue({ discount: 0 })
    }
  }
  setGST() {
    if (this.jobCardForm.value.gstPercentage) {
      const amount = this.jobCardForm.value.rate * this.jobCardForm.value.quantity;
      const gst = ((amount - this.jobCardForm.value.discount) * this.jobCardForm.value.gstPercentage) / 100;
      const total = (amount - this.jobCardForm.value.discount) + gst;
      this.jobCardForm.patchValue({
        gst: parseFloat(gst.toString()).toFixed(2),
        netAmount: parseFloat(total.toString()).toFixed(2)
      })
    } else {
      const amount = this.jobCardForm.value.rate * this.jobCardForm.value.quantity;
      const total = amount - this.jobCardForm.value.discount;
      this.jobCardForm.patchValue({
        gst: 0,
        netAmount: parseFloat(total.toString()).toFixed(2)
      })
    }
  }
  reset() {
    this.jobCardForm.reset()
  }

  setAmount() {
    const total = this.jobCardForm.value.quantity * this.jobCardForm.value.rate;
    this.jobCardForm.patchValue({
      netAmount: total.toFixed(2)
    })
    // this.addData();
  }

  setNewJob() {
    const jobCardNumber = this.jobs.length > 0 ? this.jobs.length + 1 : 1

  }

  checkJob(recordNo: number) {
    let jobCardNumber = 0;
    if (this.jobIDandCardMap[recordNo]) {
      jobCardNumber = this.jobIDandCardMap[recordNo];
      this.jobCardNumber = jobCardNumber
      this.getJob(jobCardNumber);
    } else {
      jobCardNumber = this.jobs.length > 0 ? this.jobs.length + 1 : 1
      this.jobCardNumber = jobCardNumber;
      this.setJob(recordNo)
    }
  }

  setJob(recordNo: number) {
    // let jobCardNumber = 0;
    // if (this.jobIDandCardMap[recordNo]) {
    //   jobCardNumber = this.jobIDandCardMap[recordNo];
    // } else {
    //   jobCardNumber = this.jobs.length > 0 ? parseInt(this.jobs[0].jobCardNo.toString()) + 1 : 1
    //   this.jobIDandCardMap[recordNo] = jobCardNumber
    // }
    this.currentJob = recordNo;
    this.jobCardForm.patchValue({
      recordNo: recordNo,
      // jobCardNo: jobCardNumber
    })
    // console.log('enable')
    this.productForm.enable();
    this.jobCardForm.enable();
    //TODO set data from card data to form

    const index = this.cardData.findIndex(c => c.recordNo === recordNo)

    if (index >= 0) {
      const data = this.cardData[index]
      this.spareParts = data.spareParts
      // console.log('data.mechanicName', this.getMechanicIndex(data.mechanicName), data)
      this.jobCardForm.patchValue({
        paymentMode: data.paymentMode,
        recordNo: data.recordNo,
        mechanicName: this.mechanics[this.getMechanicIndex(data.mechanicName)],
        jobCardDate: data.jobCardDate,
        chasisNumber: data.chasisNumber,
        engineNumber: data.engineNumber,
        registrationNumber: this.vehicles[this.getVehicleIndex(data.registrationNumber)],
        modelName: data.modelName,
        kmCovered: data.kmCovered,
        billDate: data.billDate,
        oilChange: data.oilChange,
        service: data.service,
        problem: data.problem,
        totalNetAmount: data.netAmount,
        comment: data.comment,
        status: data.status
      })
    } else {
      this.spareParts = [];
      this.jobCardForm = new FormGroup({
        jobCardNo: new FormControl(this.jobCardNumber),
        paymentMode: new FormControl('Credit'),
        recordNo: new FormControl(recordNo),
        mechanicName: new FormControl(''),
        registrationNumber: new FormControl('', Validators.required),
        billDate: new FormControl(new Date().toISOString().substring(0, 10)),
        jobCardDate: new FormControl(new Date().toISOString().substring(0, 10)),
        modelName: new FormControl(''),
        chasisNumber: new FormControl(''),
        engineNumber: new FormControl(''),
        kmCovered: new FormControl('', Validators.required),
        oilChange: new FormControl('No'),
        service: new FormControl('No'),
        problem: new FormControl('Service and General Maintenance'),
        partNo: new FormControl(''),
        partName: new FormControl(''),
        rate: new FormControl(''),
        unit: new FormControl(''),
        quantity: new FormControl(''),
        netAmount: new FormControl(''),
        totalNetAmount: new FormControl(''),
        comment: new FormControl(''),
        status: new FormControl('Running')
      })

    }
    // this.productForm.enable();
    // this.jobCardForm.enable();
    this.jobCardDateElement.nativeElement.focus();
  }

  cancelUpdate() {
    this.jobCardForm.patchValue({
      partNo: '',
      partName: '',
      quantity: 0,
      rate: 0,
      unit: '',
      discountPercentage: 0,
      discount: 0,
      // grossAmount: 0,
      gstPercentage: 0,
      gst: 0,
      netAmount: 0
    })
    this.selectedProduct = {};
    this.selectedIndex = -1
    this.partNo.query = '';// clear input
    this.partNo.focus()
  }

  update() {
    // this.setDiscount()
    // this.setGST()
    this.setAmount();
    this.addData();
  }

  editData(index: number) {
    const spareParts = this.spareParts[index];
    this.selectedIndex = index;
    console.log(spareParts)
    this.setProductField({ partNumber: spareParts.partNo });
    setTimeout(() => {
      this.jobCardForm.patchValue({
        quantity: spareParts.quantity,
        rate: spareParts.rate,
        unit: spareParts.unit,
        netAmount: spareParts.netAmount
      })
    }, 100)

  }

  deleteData(index: number) {
    this.spareParts.splice(index, 1);
    this.calculateTotal()
  }

  addData() {
    if (this.jobCardForm.invalid || this.jobCardForm.value.quantity === 0 || this.jobCardForm.value.partNo?.netAmount === 0) return;
    if (this.selectedProduct && this.selectedIndex > -1) {
      this.spareParts[this.selectedIndex] = {
        partNo: this.jobCardForm.value.partNo?.partNumber,
        partName: this.jobCardForm.value.partName?.partName,
        quantity: this.jobCardForm.value.quantity,
        rate: this.jobCardForm.value.rate,
        unit: this.jobCardForm.value.unit,
        netAmount: this.jobCardForm.value.netAmount,
        ledgerPageNumber: this.jobCardForm.value.partName.ledgerPageNumber,
        categoryId: this.jobCardForm.value.partName.category,
      }
    }
    else {
      console.log(this.spareParts.some((s: any) => s.partNo === this.jobCardForm.value.partNo?.partNumber))
      if (this.spareParts.some((s: any) => s.partNo === this.jobCardForm.value.partNo?.partNumber)) return;
      this.spareParts.push({
        partNo: this.jobCardForm.value.partNo?.partNumber,
        partName: this.jobCardForm.value.partName?.partName,
        quantity: this.jobCardForm.value.quantity,
        rate: this.jobCardForm.value.rate ? this.jobCardForm.value.rate.toFixed(2) : '0',
        unit: this.jobCardForm.value.unit,
        netAmount: this.jobCardForm.value.netAmount,
        ledgerPageNumber: this.jobCardForm.value.partName.ledgerPageNumber,
        categoryId: this.jobCardForm.value.partName.category,
      })
    }
    this.cancelUpdate();
    this.calculateTotal();
  }

  addWorker() {
    const account: Account = {
      accountName: this.jobCardForm.value.mechanicName,
      groupName: this.workerID,
      address: '',
      phone: ''
    }
    this.accountService.saveAccount(account).subscribe(() => {
      this.getAllAccounts();
    })
  }

  addToSupplyOrder() {
    if (this.jobCardForm.value.partName) {
      if (this.jobCardForm.value.partName.toLowerCase().includes('repaired')) {
        const payload = {
          "partsData": [
            this.jobCardForm.value.partName],
          "workOrderNumber": this.orders.length + 1,
          "serviceProviderName": this.prodcutSupplier[this.jobCardForm.value.partName.partNumber] ? this.prodcutSupplier[this.jobCardForm.value.partName.partNumber].supplierName : '',
          "totalQuantity": 10,
          "totalAmount": this.jobCardForm.value.newRate ? this.jobCardForm.value.newRate * 10 : this.jobCardForm.value.saleRate * 10,
          "comment": "",
          "status": "Pending",
          "date": new Date().toISOString().substring(0, 10),
          assemblesData: []
        }
        console.log(payload);
        this.workOrderService.saveWorkOrder(payload).subscribe(res => {
          this.prodcutSupplier[this.jobCardForm.value.partNo.partNumber].orderPlaced = true
        })
      } else {
        const payload = {
          "partsData": [
            this.jobCardForm.value.partName],
          "supplyOrderNumber": this.orders.length + 1,
          "supplierName": this.prodcutSupplier[this.jobCardForm.value.partName.partNumber] ? this.prodcutSupplier[this.jobCardForm.value.partName.partNumber].supplierName : '',
          "totalQuantity": 10,
          "totalAmount": this.jobCardForm.value.newRate ? this.jobCardForm.value.newRate * 10 : this.jobCardForm.value.saleRate * 10,
          "comment": "",
          "status": "Pending",
          "date": new Date().toISOString().substring(0, 10)
        }
        console.log(payload);
        this.supplyOrderService.saveSupplyOrder(payload).subscribe(res => {
          this.prodcutSupplier[this.jobCardForm.value.partNo.partNumber].orderPlaced = true
        })
      }
      // alert('work in progress')
    }
  }

  calculateTotal() {
    // let grossAmount = 0;
    // let gst = 0
    // let discount = 0;
    let netAmount = 0;
    this.spareParts.map(d => {
      // grossAmount = grossAmount + parseFloat(d.grossAmount);
      // gst = gst + parseFloat(d.sgstAmount) + parseFloat(d.cgstAmount);
      // discount = discount + parseFloat(d.discount);
      netAmount = netAmount + parseFloat(d.netAmount.toString(2))
    })
    // const total = grossAmount - discount;
    // netAmount = netAmount + g;
    this.jobCardForm.patchValue({
      // grossAmount: parseFloat(grossAmount.toString()).toFixed(2),
      // gstTotal: parseFloat(gst.toString()).toFixed(2),
      // tradeDiscount: parseFloat(discount.toString()).toFixed(2),
      // grandTotal: parseFloat(total.toString()).toFixed(2),
      totalNetAmount: parseFloat(netAmount.toString()).toFixed(2),
    })
  }

  report() {
    // this.saveJob()
    // const doc1 = new jsPDF()
    const data: any = []
    const categoriesWiseData: any = {}
    this.spareParts.map((item, index) => {
      const arr = [];
      arr.push(index + 1)
      arr.push(item.partNo)
      arr.push(item.partName)
      arr.push(item.ledgerPageNumber)
      arr.push(item.quantity)
      arr.push(item.unit)
      arr.push(item.rate)
      arr.push(item.netAmount)
      arr.push(item.categoryId);
      data.push(arr);
      categoriesWiseData[item.categoryId] = [];
    })

    // this.spareParts.map((item, index) => {
    //   const arr = [];
    //   arr.push(index + 1)
    //   arr.push(item.partNo)
    //   arr.push(item.partName)
    //   arr.push(item.ledgerPageNumber)
    //   arr.push(item.quantity)
    //   arr.push(item.unit)
    //   arr.push(item.rate)
    //   arr.push(item.netAmount)
    //   data.push(arr);
    //   categoriesWiseData[item.categoryId] = [];
    // })


    const newData: any = [];
    Object.keys(categoriesWiseData).map(c => {
      let arr = [];
      arr.push('')
      arr.push(this.categroysObj[c])
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('')
      newData.push(arr);
      let total = 0;
      let count = 1;
      data.map((item: any, index: number) => {
        arr = [];
        console.log(c, item[item.length - 1])
        if (item[item.length - 1] === c) {
          arr.push(count)
          arr.push(item[1])
          arr.push(item[2])
          arr.push(item[3])
          arr.push(item[4])
          arr.push(item[5])
          arr.push(item[6])
          arr.push(item[7])
          total = total + parseFloat(item[7])
          newData.push(arr);
          count++;
        }
      })
      arr = [];
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('')
      arr.push('Total')
      arr.push(total.toFixed(2))
      newData.push(arr);
    })
    this.generateReport(newData);
    this.reset();
    this.spareParts = []
    // It can parse html:
    // <table id="my-table"><!-- ... --></table>
    // autoTable(doc1, { html: '#job-card' })
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
    // doc.text("Invoice", 90, 15)
    doc.text(companyName, 100, 15, { align: 'center' })
    doc.setFontSize(7);
    doc.text("Address: Katraj, Pune.", 100, 23, { align: 'center' })

    // doc.autoTable({ html: '#my-table' })
    // doc.text("Wishvayodha Multitrade", 14, 20);
    doc.setFontSize(10);
    doc.line(14, 30, 196, 30);
    doc.text("Job Card No:", 14, 35);
    doc.text(this.jobCardForm.value.jobCardNo.toString(), 35, 35);
    doc.text("Bill Date:", 150, 35)
    // doc.setFont('', 'bold');
    doc.text(this.jobCardForm.value.jobCardDate, 175, 35)
    doc.line(14, 38, 196, 38);

    doc.text("Vehicle Number:", 14, 45);
    doc.text(this.jobCardForm.value.registrationNumber.vehicleNumber, 45, 45);
    doc.text("Model Name:", 120, 45)
    doc.text(this.jobCardForm.value.modelName, 145, 45)

    doc.text("Mechanic Name:", 14, 50);
    doc.text(this.jobCardForm.value?.mechanicName ? this.jobCardForm.value?.mechanicName?.accountName : '', 45, 50);
    doc.text("KM Covered:", 120, 50)
    doc.text(this.jobCardForm.value.kmCovered.toString(), 145, 50)

    // doc.text("GST No:", 14, 55);
    doc.text("Payment Mode:", 14, 55)
    doc.text(this.jobCardForm.value.paymentMode, 45, 55)

    doc.line(14, 60, 196, 60);
    // TODO to get address use this
    // this.accounts[this.getAccountIndex(res.mechanicName)]

    // doc.line(14, 35, 196, 35);
    // doc.setFontSize(8);

    // doc.text("Bill No: " + this.jobCardForm.value.jobCardNo.toString(), 14, 40)
    // doc.text("Firm Name: Wishvayodha Multitrade", 14, 45)

    // doc.text("Date: " + this.jobCardForm.value.jobCardDate, 140, 40)
    // // doc.text("Firm Name: Wishvayodha Multitrade", 10, 40)
    // doc.text("Type: " + this.jobCardForm.value.paymentMode, 140, 45)
    // doc.line(14, 50, 196, 50);

    // doc.table(10, 60, this.generateData(10), this.headers, { fontSize: 7, });
    // 
    // const doc2 = new jsPDF();
    // if (this.jobCardForm.value.comment) {
    //   body.push(['', '', '', '', '', '', '', '']);
    //   body.push(['', 'Items Description: \n' + this.jobCardForm.value.comment, '', '', '', '', , '', '']);
    // }
    (doc as any).autoTable({
      head: [[
        "Sr.No.",
        "Part No.",
        "Part Name",
        "Ledger No.",
        "Quantity",
        "Unit",
        "Rate",
        "Amount",
        // "Net Amount"
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
          head.cell.styles.halign = 'center'
        }
        if (head.cell.raw === 'Part No.' || head.cell.raw === 'Part Name') {
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
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.jobCardForm.value.totalNetAmount)), 14, tableHeight + 10)
    doc.line(14, tableHeight + 5, 196, tableHeight + 5);
    // doc.text('In Word: RS: ***', 14, tableHeight + 10)
    // doc.text('In Word: RS: ' + this.inWords(parseInt(this.jobCardForm.value.totalNetAmount)), 14, tableHeight + 5)
    doc.text('INR In Words: ' + this.inWords(parseInt(this.jobCardForm.value.totalNetAmount)), 14, tableHeight + 10)
    if (this.jobCardForm.value.comment) {
      doc.text('Remarks: \n' + this.jobCardForm.value.comment, 14, tableHeight + 15)
    }
    doc.text("Grand Total Amount:", 165, tableHeight + 15, { align: 'right' })
    doc.text(this.jobCardForm.value.totalNetAmount, 195, tableHeight + 15, { align: 'right' })
    // doc.text("CGST Amount:", 150, tableHeight + 20, { align: 'right' })
    // const gst: number = parseFloat(this.jobCardForm.value.gstTotal) / 2;
    // doc.text(gst.toFixed(2), 180, tableHeight + 20, { align: 'right' })
    // doc.text("SGST Amount:", 150, tableHeight + 25, { align: 'right' })
    // doc.text(gst.toFixed(2), 180, tableHeight + 25, { align: 'right' })
    // doc.text("Total Discount:", 150, tableHeight + 30, { align: 'right' })
    // let discount = '0';
    // if (this.jobCardForm.value.tradeDiscount) {
    //   discount = '- ' + this.jobCardForm.value.tradeDiscount.toString()
    // }
    // doc.text(discount, 180, tableHeight + 30, { align: 'right' })
    // doc.line(14, tableHeight + 35, 196, tableHeight + 35);
    // doc.text("Net Amount:", 150, tableHeight + 40, { align: 'right' })
    // doc.text(this.jobCardForm.value.totalNetAmount, 180, tableHeight + 40, { align: 'right' })
    // doc.line(14, tableHeight + 45, 196, tableHeight + 45);

    doc.line(14, doc.internal.pageSize.height - 50, 196, doc.internal.pageSize.height - 50);

    if (tableHeight < doc.internal.pageSize.height - 50) {
      doc.text('Signature', 14, doc.internal.pageSize.height - 30);
      doc.text('Seal', 150, doc.internal.pageSize.height - 30);
    }
    // doc.save("report-purchase.pdf");
    window.open(doc.output('bloburl'), '_blank');
  }

  test1() {
    const num = parseInt(this.jobCardForm.value.totalNetAmount);
    console.log(this.inWords(num), this.jobCardForm.value.totalNetAmount)
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

  loadJob(which: string) {
    const jobNo: number = this.jobCardNumber
    switch (which) {
      case 'first':
        this.router.navigate(['job-card', 1])
        this.ngOnInit();
        break;
      case 'last':
        this.router.navigate(['job-card', this.jobs.length])
        this.ngOnInit();
        break;
      case 'next':
        if (this.jobs.length > jobNo) {
          this.router.navigate(['job-card', (jobNo + 1)])
          this.ngOnInit();
        }
        break;
      case 'previous':
        if (jobNo > 1) {
          this.router.navigate(['job-card', (jobNo - 1)])
          this.ngOnInit();
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
