import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsOutwardComponent } from './parts-outward.component';

describe('PartsOutwardComponent', () => {
  let component: PartsOutwardComponent;
  let fixture: ComponentFixture<PartsOutwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartsOutwardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PartsOutwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
