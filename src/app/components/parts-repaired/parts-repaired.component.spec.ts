import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartsRepairedComponent } from './parts-repaired.component';

describe('PartsRepairedComponent', () => {
  let component: PartsRepairedComponent;
  let fixture: ComponentFixture<PartsRepairedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartsRepairedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartsRepairedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
