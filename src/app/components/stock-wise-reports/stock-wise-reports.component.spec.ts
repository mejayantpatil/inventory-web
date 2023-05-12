import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockWiseReportsComponent } from './stock-wise-reports.component';

describe('StockWiseReportsComponent', () => {
  let component: StockWiseReportsComponent;
  let fixture: ComponentFixture<StockWiseReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockWiseReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockWiseReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
