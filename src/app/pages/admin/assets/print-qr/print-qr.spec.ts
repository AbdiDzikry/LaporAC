import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintQr } from './print-qr';

describe('PrintQr', () => {
  let component: PrintQr;
  let fixture: ComponentFixture<PrintQr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintQr]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintQr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
