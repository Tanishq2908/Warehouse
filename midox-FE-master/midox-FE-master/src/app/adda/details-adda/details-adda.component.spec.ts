import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAddaComponent } from './details-adda.component';

describe('DetailsAddaComponent', () => {
  let component: DetailsAddaComponent;
  let fixture: ComponentFixture<DetailsAddaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsAddaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsAddaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
