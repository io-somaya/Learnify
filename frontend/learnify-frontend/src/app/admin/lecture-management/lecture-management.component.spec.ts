import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureManagementComponent } from './lecture-management.component';

describe('LectureManagementComponent', () => {
  let component: LectureManagementComponent;
  let fixture: ComponentFixture<LectureManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectureManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LectureManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
