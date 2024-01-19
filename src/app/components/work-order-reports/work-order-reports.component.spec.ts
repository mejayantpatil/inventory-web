import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderReportsComponent } from './work-order-reports.component';

describe('WorkOrderReportsComponent', () => {
  let component: WorkOrderReportsComponent;
  let fixture: ComponentFixture<WorkOrderReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkOrderReportsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WorkOrderReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
