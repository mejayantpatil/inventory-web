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

const routes: Routes = [
  {
    path: 'dashboard', component: DashboardComponent
  },
  {
    path: 'accounts', component: AccountsComponent
  },
  {
    path: 'groups', component: GroupsComponent
  },
  {
    path: 'categorys', component: CategorysComponent
  },
  {
    path: 'products', component: ProductsComponent
  },
  {
    path: 'part-inward/:transactionNumber', component: PartsInwardComponent
  },
  {
    path: 'part-repaired/:transactionNumber', component: PartsRepairedComponent
  },
  {
    path: 'job-card/:jobCardNumber', component: JobCardComponent
  },
  {
    path: 'job-card', component: JobCardComponent
  },
  {
    path: 'work-orders', component: WorkOrdersComponent
  },
  {
    path: 'purchase-reports', component: PurchaseReportsComponent
  },
  {
    path: 'stock-wise-reports', component: StockWiseReportsComponent
  },
  {
    path: 'product-wise-consumption-reports', component: ProductWiseConsumptionReportsComponent
  },
  {
    path: 'job-wise-consumption-reports', component: JobWiseConsumptionReportsComponent
  },
  {
    path: 'vehicle-wise-consumption-report', component: VehicleReportsComponent
  },
  {
    path: 'consumption-reports', component: ConsumptionReportsComponent
  },
  {
    path: 'jobs', component: JobsComponent
  },
  {
    path: 'vehicles', component: VehiclesComponent
  },
  {
    path: 'reports', component: ReportsComponent
  },
  {
    path: 'transactions', component: TransactionComponent
  },
  {
    path: 'purchase-order', component: SupplyOrderComponent
  },
  {
    path: 'login', component: LoginComponent
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'profile', component: ProfileComponent
  },
  {
    path: 'profile/:id', component: ProfileComponent
  },
  {
    path: 'shortlist', component: ShortlistComponent
  },
  {
    path: 'chat', component: ChatComponent
  },
  {
    path: 'search', component: SearchComponent
  },
  {
    path: '', component: LoginComponent
  },
  {
    path: 'users', component: UsersComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
