import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductWiseConsumptionReportsComponent } from './product-wise-consumption-reports.component';

describe('ProductWiseConsumptionReportsComponent', () => {
  let component: ProductWiseConsumptionReportsComponent;
  let fixture: ComponentFixture<ProductWiseConsumptionReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductWiseConsumptionReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductWiseConsumptionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
