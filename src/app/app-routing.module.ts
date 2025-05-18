import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsComponent } from './components/accounts/accounts.component';
import { CategorysComponent } from './components/categorys/categorys.component';
import { ChatComponent } from './components/chat/chat.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GroupsComponent } from './components/groups/groups.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SearchComponent } from './components/search/search.component';
import { ShortlistComponent } from './components/shortlist/shortlist.component';
import { UsersComponent } from './components/users/users.component';
import { PartsInwardComponent } from './components/parts-inward/parts-inward.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { TransactionComponent } from './components/transactions/transactions.component';
import { ReportsComponent } from './components/reports/reports.component';
import { JobCardComponent } from './components/job-card/job-card.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { PurchaseReportsComponent } from './components/purchase-reports/purchase-reports.component';
import { StockWiseReportsComponent } from './components/stock-wise-reports/stock-wise-reports.component';
import { ConsumptionReportsComponent } from './components/consumption-reports/consumption-reports.component';
import { PartsRepairedComponent } from './components/parts-repaired/parts-repaired.component';
import { ProductWiseConsumptionReportsComponent } from './components/product-wise-consumption-reports/product-wise-consumption-reports.component';
import { SupplyOrderComponent } from './components/supply-order/supply-order.component';
import { WorkOrdersComponent } from './components/work-orders/work-orders.component';
import { JobWiseConsumptionReportsComponent } from './components/job-wise-consumption-reports/job-wise-consumption-reports.component';
import { VehicleReportsComponent } from './components/vehicle-reports/vehicle-reports.component';
import { AuthGuard } from './services/auth.guard';
import { PartsOutwardComponent } from './components/parts-outward/parts-outward.component';
import { OutTransactionComponent } from './components/out-transactions/transactions.component';
import { PurchaseOrderReportsComponent } from './components/purchase-order-reports/purchase-order-reports.component';
import { WorkOrderReportsComponent } from './components/work-order-reports/work-order-reports.component';
import { PartOutComponent } from './components/part-out/part-out.component';
import { RepairedPartsReportsComponent } from './components/repaired-parts-reports/repaired-parts-reports.component';

const routes: Routes = [
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'groups', component: GroupsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'categorys', component: CategorysComponent, canActivate: [AuthGuard]
  },
  {
    path: 'products', component: ProductsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'part-outward/:transactionNumber', component: PartsOutwardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'part-inward/:transactionNumber', component: PartsInwardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'part-repaired/:transactionNumber', component: PartsRepairedComponent, canActivate: [AuthGuard]
  },
  {
    path: 'job-card/:jobCardNumber', component: JobCardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'job-card', component: JobCardComponent, canActivate: [AuthGuard]
  },
  {
    path: 'work-orders', component: WorkOrdersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'purchase-reports', component: PurchaseReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'purchase-order-reports', component: PurchaseOrderReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'work-order-reports', component: WorkOrderReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'stock-wise-reports', component: StockWiseReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'product-wise-consumption-reports', component: ProductWiseConsumptionReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'job-wise-consumption-reports', component: JobWiseConsumptionReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'vehicle-wise-consumption-report', component: VehicleReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'consumption-reports', component: ConsumptionReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'jobs', component: JobsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'vehicles', component: VehiclesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'reports', component: ReportsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'transactions', component: TransactionComponent, canActivate: [AuthGuard]
  },
  {
    path: 'out-transactions', component: OutTransactionComponent, canActivate: [AuthGuard]
  },
  {
    path: 'purchase-order', component: SupplyOrderComponent, canActivate: [AuthGuard]
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'home', component: HomeComponent, canActivate: [AuthGuard]
  },
  {
    path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'shortlist', component: ShortlistComponent, canActivate: [AuthGuard]
  },
  {
    path: 'chat', component: ChatComponent, canActivate: [AuthGuard]
  },
  {
    path: 'search', component: SearchComponent, canActivate: [AuthGuard]
  },
  {
    path: '', component: LoginComponent,
  },
  {
    path: 'users', component: UsersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'part-out', component: PartOutComponent, canActivate: [AuthGuard]
  },
  {
    path: 'repaired-parts-report', component: RepairedPartsReportsComponent, canActivate: [AuthGuard]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
