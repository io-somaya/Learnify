import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureEditComponent } from './lecture-edit.component';

describe('LectureEditComponent', () => {
  let component: LectureEditComponent;
  let fixture: ComponentFixture<LectureEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectureEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LectureEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
