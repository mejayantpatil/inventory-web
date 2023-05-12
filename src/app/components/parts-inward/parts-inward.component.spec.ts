import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsInwardComponent } from './parts-inward.component';

describe('PartsInwardComponent', () => {
  let component: PartsInwardComponent;
  let fixture: ComponentFixture<PartsInwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsInwardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartsInwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
