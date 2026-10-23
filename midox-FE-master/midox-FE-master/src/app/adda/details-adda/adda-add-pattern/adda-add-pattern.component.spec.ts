import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddaAddPatternComponent } from './adda-add-pattern.component';

describe('AddaAddPatternComponent', () => {
  let component: AddaAddPatternComponent;
  let fixture: ComponentFixture<AddaAddPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddaAddPatternComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddaAddPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
