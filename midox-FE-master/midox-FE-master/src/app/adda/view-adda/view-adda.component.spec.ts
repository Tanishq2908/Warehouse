import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAddaComponent } from './view-adda.component';

describe('ViewAddaComponent', () => {
  let component: ViewAddaComponent;
  let fixture: ComponentFixture<ViewAddaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAddaComponent]
    });
    fixture = TestBed.createComponent(ViewAddaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
