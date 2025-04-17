import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssignmentComponent } from './edit-assignment.component';

describe('EditAssignmentComponent', () => {
  let component: EditAssignmentComponent;
  let fixture: ComponentFixture<EditAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
