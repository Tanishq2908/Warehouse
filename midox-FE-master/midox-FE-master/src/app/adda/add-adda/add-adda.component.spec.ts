import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAddaComponent } from './add-adda.component';

describe('AddAddaComponent', () => {
  let component: AddAddaComponent;
  let fixture: ComponentFixture<AddAddaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAddaComponent]
    });
    fixture = TestBed.createComponent(AddAddaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
