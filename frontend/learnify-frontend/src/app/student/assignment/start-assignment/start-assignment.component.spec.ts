import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAssignmentComponent } from './start-assignment.component';

describe('StartAssignmentComponent', () => {
  let component: StartAssignmentComponent;
  let fixture: ComponentFixture<StartAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAssignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
