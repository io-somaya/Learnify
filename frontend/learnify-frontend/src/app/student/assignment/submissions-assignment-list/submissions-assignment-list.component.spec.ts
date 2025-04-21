import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionsAssignmentListComponent } from './submissions-assignment-list.component';

describe('SubmissionsAssignmentListComponent', () => {
  let component: SubmissionsAssignmentListComponent;
  let fixture: ComponentFixture<SubmissionsAssignmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionsAssignmentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionsAssignmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
