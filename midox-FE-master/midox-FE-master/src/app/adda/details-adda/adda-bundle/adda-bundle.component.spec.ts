import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddaBundleComponent } from './adda-bundle.component';

describe('AddaBundleComponent', () => {
  let component: AddaBundleComponent;
  let fixture: ComponentFixture<AddaBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddaBundleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddaBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
