import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/accounts.service';
import { CardService } from 'src/app/services/cards.service';
import { CategoryService } from 'src/app/services/category.service';
import { GroupService } from 'src/app/services/groups.service';
import { JobService } from 'src/app/services/jobs.service';
import { ProductService } from 'src/app/services/products.service';
import { SupplyOrderService } from 'src/app/services/supplyOrderService';
import { TransactionService } from 'src/app/services/transactions.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { WorkOrderService } from 'src/app/services/work-order.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public path: string
  public activeMenu: string = ''
  @ViewChild('toast') toast: any;
  @ViewChild('mobileToggle') mobileToggle: any;
  public loginMenu: boolean = false;
  constructor(private router: Router,
    private accountService: AccountService,
    private jobsService: JobService,
    private cardService: CardService,
    private productService: ProductService,
    private groupService: GroupService,
    private supplyOrderService: SupplyOrderService,
    private workOrderService: WorkOrderService,
    private categoryService: CategoryService,
    private vehicleService: VehicleService,
    private transactionService: TransactionService) {
    this.path = ''
    this.router.events.subscribe(res => {
      this.path = window.location.pathname;
      this.activeMenu = window.location.pathname.split('/')[1]
      this.loginMenu = window.location.hash === '#/' || window.location.hash === '#/login' // window.document.URL.includes('') || window.document.URL.includes('login')
    })
  }

  ngOnInit(): void {

  }

  toggleMenu() {
    // console.log(this.mobileToggle.nativeElement.checkVisibility());
    // if (this.mobileToggle) {
    this.mobileToggle.nativeElement.click();
    // this.mobileToggle.nativeElement.className = 'navbar-toggler collapsed'
    // }
  }

  search() {
    // this.router.navigate(['search'])
  }

  async backup() {
    await this.transactionService.backUp().subscribe(res => {

    })
    await this.groupService.backUp().subscribe(() => {

    })
    await this.accountService.backUp().subscribe(() => {

    })
    await this.jobsService.backUp().subscribe(() => {
      this.toast.nativeElement.setAttribute('class', 'toast show')
      setTimeout(() => {
        this.toast.nativeElement.setAttribute('class', 'toast hide')
      }, 2000)

    })
    await this.cardService.backUp().subscribe(() => {

    })
    await this.productService.backUp().subscribe(() => {

    })
    await this.supplyOrderService.backUp().subscribe(() => {

    })
    await this.workOrderService.backUp().subscribe(() => {

    })
    await this.categoryService.backUp().subscribe(() => {

    })
    await this.vehicleService.backUp().subscribe(() => {

    })

  }
}
