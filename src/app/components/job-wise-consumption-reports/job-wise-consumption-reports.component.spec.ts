import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobWiseConsumptionReportsComponent } from './job-wise-consumption-reports.component';

describe('JobWiseConsumptionReportsComponent', () => {
  let component: JobWiseConsumptionReportsComponent;
  let fixture: ComponentFixture<JobWiseConsumptionReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobWiseConsumptionReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobWiseConsumptionReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
