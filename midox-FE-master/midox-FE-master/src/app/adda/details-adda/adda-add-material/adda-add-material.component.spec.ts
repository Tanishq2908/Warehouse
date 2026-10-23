import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddaAddMaterialComponent } from './adda-add-material.component';

describe('AddaAddMaterialComponent', () => {
  let component: AddaAddMaterialComponent;
  let fixture: ComponentFixture<AddaAddMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddaAddMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddaAddMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
