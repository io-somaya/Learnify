import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLectureComponent } from './add-lecture.component';

describe('AddLectureComponent', () => {
  let component: AddLectureComponent;
  let fixture: ComponentFixture<AddLectureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLectureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLectureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
