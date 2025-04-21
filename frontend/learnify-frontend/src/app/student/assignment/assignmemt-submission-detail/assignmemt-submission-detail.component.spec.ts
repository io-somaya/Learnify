import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmemtSubmissionDetailComponent } from './assignmemt-submission-detail.component';

describe('AssignmemtSubmissionDetailComponent', () => {
  let component: AssignmemtSubmissionDetailComponent;
  let fixture: ComponentFixture<AssignmemtSubmissionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmemtSubmissionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmemtSubmissionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
