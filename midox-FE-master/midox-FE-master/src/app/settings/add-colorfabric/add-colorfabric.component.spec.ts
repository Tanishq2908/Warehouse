import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddColorfabricComponent } from './add-colorfabric.component';

describe('AddColorfabricComponent', () => {
  let component: AddColorfabricComponent;
  let fixture: ComponentFixture<AddColorfabricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddColorfabricComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddColorfabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
