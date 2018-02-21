import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasswalletComponent } from './masswallet.component';

describe('MasswalletComponent', () => {
  let component: MasswalletComponent;
  let fixture: ComponentFixture<MasswalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasswalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasswalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
