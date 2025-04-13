import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLessonComponent } from './edit-lesson.component';

describe('EditLessonComponent', () => {
  let component: EditLessonComponent;
  let fixture: ComponentFixture<EditLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
