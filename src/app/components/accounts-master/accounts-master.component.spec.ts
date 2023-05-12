import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsMasterComponent } from './accounts-master.component';

describe('AccountsMasterComponent', () => {
  let component: AccountsMasterComponent;
  let fixture: ComponentFixture<AccountsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountsMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
