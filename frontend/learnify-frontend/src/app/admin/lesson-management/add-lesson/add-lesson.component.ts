
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LessonService } from '../../../services/lessons.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-create-lesson',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-lesson.component.html',
  styleUrls: ['./add-lesson.component.scss']
})
export class AddLessonComponent implements OnInit {
  lessonForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    private router: Router,
    private toastr: ToastService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      grade: [null, [Validators.required, Validators.min(1), Validators.max(3)]],
      youtube_embed_code: ['']
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.lessonForm.invalid) {
      Object.keys(this.lessonForm.controls).forEach(key => {
        const control = this.lessonForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.lessonService.createLesson(this.lessonForm.value)
      .subscribe({
        next: (lesson) => {
          console.log('Lesson created successfully:', lesson);
          this.router.navigate(['/admin/dashboard/lessons-management']);
          this.toastr.success('Lesson created successfully');

        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to create lesson. Please try again.';
          console.error('Error creating lesson:', error);
          this.toastr.error('Error creating lesson', error.message);
        }
      });
  }
}