import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ShortlistComponent } from './components/shortlist/shortlist.component';
import { ChatComponent } from './components/chat/chat.component';
import { SearchComponent } from './components/search/search.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { HttpClientModule } from '@angular/common/http';
import { AccountsComponent } from './components/accounts/accounts.component';
import { GroupsComponent } from './components/groups/groups.component';
import { CategorysComponent } from './components/categorys/categorys.component';
import { ProductsComponent } from './components/products/products.component';
import { PartsInwardComponent } from './components/parts-inward/parts-inward.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { TransactionComponent } from './components/transactions/transactions.component';
import { FilterPipe } from './components/products/products.filter';
import { FilterInvoice } from './components/transactions/transaction.filter';
import { ReportsComponent } from './components/reports/reports.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { JobCardComponent } from './components/job-card/job-card.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { FilterJob } from './components/jobs/job.filter';
import { PurchaseReportsComponent } from './components/purchase-reports/purchase-reports.component';
import { StockWiseReportsComponent } from './components/stock-wise-reports/stock-wise-reports.component';
import { ConsumptionReportsComponent } from './components/consumption-reports/consumption-reports.component';
import { PartsRepairedComponent } from './components/parts-repaired/parts-repaired.component';
import { MenusComponent } from './components/menus/menus.component';
import { ProductWiseConsumptionReportsComponent } from './components/product-wise-consumption-reports/product-wise-consumption-reports.component';
import { SupplyOrderComponent } from './components/supply-order/supply-order.component';
import { AccountsMasterComponent } from './components/accounts-master/accounts-master.component';
import { WorkOrdersComponent } from './components/work-orders/work-orders.component';
import { JobWiseConsumptionReportsComponent } from './components/job-wise-consumption-reports/job-wise-consumption-reports.component';
import { VehicleReportsComponent } from './components/vehicle-reports/vehicle-reports.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AgChartsAngularModule } from 'ag-charts-angular';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    FooterComponent,
    HomeComponent,
    ProfileComponent,
    ShortlistComponent,
    ChatComponent,
    SearchComponent,
    SpinnerComponent,
    DashboardComponent,
    UsersComponent,
    AccountsComponent,
    GroupsComponent,
    CategorysComponent,
    ProductsComponent,
    PartsInwardComponent,
    VehiclesComponent,
    TransactionComponent,
    FilterPipe,
    FilterInvoice,
    FilterJob,
    ReportsComponent,
    JobCardComponent,
    JobsComponent,
    PurchaseReportsComponent,
    StockWiseReportsComponent,
    ConsumptionReportsComponent,
    PartsRepairedComponent,
    MenusComponent,
    ProductWiseConsumptionReportsComponent,
    SupplyOrderComponent,
    AccountsMasterComponent,
    WorkOrdersComponent,
    JobWiseConsumptionReportsComponent,
    VehicleReportsComponent
  ],
  imports: [
    BrowserModule,
    // import HttpClientModule after BrowserModule.,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AutocompleteLibModule,
    AgChartsAngularModule
  ],
  providers: [AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
