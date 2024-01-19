import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutTransactionComponent } from './transactions.component';

describe('OutTransactionComponent', () => {
  let component: OutTransactionComponent;
  let fixture: ComponentFixture<OutTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OutTransactionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OutTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
