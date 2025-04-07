import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakePackagesComponent } from './make-packages.component';

describe('MakePackagesComponent', () => {
  let component: MakePackagesComponent;
  let fixture: ComponentFixture<MakePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakePackagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
