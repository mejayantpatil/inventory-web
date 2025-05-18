import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartOutComponent } from './part-out.component';

describe('PartOutComponent', () => {
  let component: PartOutComponent;
  let fixture: ComponentFixture<PartOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartOutComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PartOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
