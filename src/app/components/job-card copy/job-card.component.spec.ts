import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCardComponent1 } from './job-card.component';

describe('JobCardComponent', () => {
  let component: JobCardComponent1;
  let fixture: ComponentFixture<JobCardComponent1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobCardComponent1]
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobCardComponent1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
