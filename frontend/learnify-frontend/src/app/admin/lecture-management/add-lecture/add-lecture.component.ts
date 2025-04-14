import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LectureService } from '../../../services/lecture.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-lecture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-lecture.component.html',
  styleUrls: ['./add-lecture.component.css']
})
export class AddLectureComponent implements OnInit {
  lectureForm: FormGroup;
  isSubmitting = false;
  
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'];
  grades = ['1', '2', '3'];

  constructor(
    private fb: FormBuilder,
    private lectureService: LectureService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.lectureForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      day_of_week: ['Monday', Validators.required],
      start_time: ['09:00', [Validators.required, this.validateTime]],
      end_time: ['10:00', [Validators.required, this.validateTime]],
      grade: ['', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit(): void {}

  validateTime(control: FormControl): { [key: string]: boolean } | null {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(control.value) ? null : { invalidTime: true };
  }

  onSubmit(): void {
    if (this.lectureForm.invalid) {
      this.markFormGroupTouched(this.lectureForm);
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const formValue = this.lectureForm.value;
    const lectureData = {
      ...formValue,
      start_time: this.formatTime(formValue.start_time),
      end_time: this.formatTime(formValue.end_time)
    };

    this.lectureService.createLecture(lectureData).subscribe({
      next: () => {
        this.toastService.success('Lecture created successfully');
        this.router.navigate(['/admin/dashboard/lectures-management']);
      },
      error: (error) => {
        this.toastService.error(error.message || 'Failed to create lecture');
        this.isSubmitting = false;
      }
    });
  }

  private formatTime(time: string): string {
    return time.includes(':') ? time : `${time}:00`;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get f() {
    return this.lectureForm.controls;
  }
}