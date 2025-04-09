import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LectureService } from '../../../services/lecture.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';
import { ILecture } from '../../../Interfaces/ILecture';

@Component({
  selector: 'app-edit-lecture',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './edit-lecture.component.html',
  styleUrls: ['./edit-lecture.component.css']
})
export class EditLectureComponent implements OnInit {
  lectureForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  lectureId!: number;

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  gradeLevels = ['1', '2', '3'];

  constructor(
    private fb: FormBuilder,
    private lectureService: LectureService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastService
  ) {
    this.lectureForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      day_of_week: ['Monday', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      grade: [''],
      zoom_link: ['', Validators.pattern('https?://.+')],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.lectureId = +this.route.snapshot.paramMap.get('id')!;
    this.loadLecture();
  }

  loadLecture(): void {
    this.lectureService.getLectureById(this.lectureId).subscribe({
      next: (lecture) => {
        this.lectureForm.patchValue(lecture);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load lecture';
        this.toaster.error("Failed to load lecture");
      }
    });
  }

  onSubmit(): void {
    if (this.lectureForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.lectureService.updateLecture(this.lectureId, this.lectureForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/lectures']);
        this.toaster.success('Lecture updated successfully!');
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update lecture';
        this.toaster.error("Failed to update lecture");
        this.isSubmitting = false;
      }
    });
  }

  private formatTime(time: string): string {
    if (!time.includes(':')) {
      return time + ':00';
    }
    return time;
  }

  get title() { return this.lectureForm.get('title'); }
  get description() { return this.lectureForm.get('description'); }
  get day_of_week() { return this.lectureForm.get('day_of_week'); }
  get start_time() { return this.lectureForm.get('start_time'); }
  get end_time() { return this.lectureForm.get('end_time'); }
  get zoom_link() { return this.lectureForm.get('zoom_link'); }
}