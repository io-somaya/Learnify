import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentDetailComponent } from './assignment-detail.component';

describe('AssignmentDetailComponent', () => {
  let component: AssignmentDetailComponent;
  let fixture: ComponentFixture<AssignmentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
