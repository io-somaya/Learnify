import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SDashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: SDashboardComponent;
  let fixture: ComponentFixture<SDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
