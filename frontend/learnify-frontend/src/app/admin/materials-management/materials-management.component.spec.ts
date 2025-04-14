import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsManagementComponent } from './materials-management.component';

describe('MaterialsManagementComponent', () => {
  let component: MaterialsManagementComponent;
  let fixture: ComponentFixture<MaterialsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
