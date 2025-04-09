import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LectureService } from '../../../services/lecture.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-lecture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './add-lecture.component.html',
  styleUrls: ['./add-lecture.component.css']
})
export class AddLectureComponent {
  lectureForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  // Available options for dropdowns
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  gradeLevels = ['1', '2', '3'];

  constructor(
    private fb: FormBuilder,
    private lectureService: LectureService,
    private router: Router,
    private toaster: ToastService
  ) {
    this.lectureForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      day_of_week: ['Monday', Validators.required],
      start_time: ['09:00', Validators.required],
      end_time: ['10:00', Validators.required],
      grade: [''],
      zoom_link: ['', [Validators.pattern('https?://.+')]],
      is_active: [true]
    });
  }

  // Form control getters
  get title() { return this.lectureForm.get('title') as FormControl; }
  get description() { return this.lectureForm.get('description') as FormControl; }
  get day_of_week() { return this.lectureForm.get('day_of_week') as FormControl; }
  get start_time() { return this.lectureForm.get('start_time') as FormControl; }
  get end_time() { return this.lectureForm.get('end_time') as FormControl; }
  get zoom_link() { return this.lectureForm.get('zoom_link') as FormControl; }
  get grade() { return this.lectureForm.get('grade') as FormControl; }

  onSubmit(): void {
    if (this.lectureForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const lectureData = {
      ...this.lectureForm.value,
      start_time: this.formatTime(this.lectureForm.value.start_time),
      end_time: this.formatTime(this.lectureForm.value.end_time)
    };

    this.lectureService.createLecture(lectureData).subscribe({
      next: () => {
        this.toaster.success('Lecture created successfully!');
        this.router.navigate(['/admin/dashboard/lectures-management']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create lecture';
        this.toaster.error(this.errorMessage);
        this.isSubmitting = false;
      },
      complete: () => this.isSubmitting = false
    });
  }

  private formatTime(time: string): string {
    if (!time.includes(':')) {
      return time + ':00';
    }
    return time;
  }
}