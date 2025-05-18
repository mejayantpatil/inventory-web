import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairedPartsReportsComponent } from './repaired-parts-reports.component';

describe('RepairedPartsReportsComponent', () => {
  let component: RepairedPartsReportsComponent;
  let fixture: ComponentFixture<RepairedPartsReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepairedPartsReportsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepairedPartsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
