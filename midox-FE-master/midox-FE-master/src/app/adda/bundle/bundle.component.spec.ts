import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleComponent } from './bundle.component';

describe('BundleComponent', () => {
  let component: BundleComponent;
  let fixture: ComponentFixture<BundleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BundleComponent]
    });
    fixture = TestBed.createComponent(BundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
