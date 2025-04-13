import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonService } from '../../../services/lessons.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';


@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-lesson.component.html',
  styleUrl: './edit-lesson.component.css'
})
export class EditLessonComponent implements OnInit {
  lessonForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  lessonId: number;

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastService 
  ) {
    this.lessonId = 0;
    this.lessonForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.lessonId = +params['id'];
      this.loadLesson();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      grade: [null, [Validators.required, Validators.min(1), Validators.max(3)]],
      youtube_embed_code: ['']
    });
  }

  loadLesson(): void {
    this.isLoading = true;
    this.lessonService.showTeacherLessonById(this.lessonId)
      .subscribe({
        next: (lesson) => {
          this.lessonForm.patchValue({
            title: lesson.title,
            description: lesson.description,
            grade: lesson.grade,
            youtube_embed_code: lesson.youtube_embed_code
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to load lesson details.';
          this.isLoading = false;
          console.error('Error loading lesson:', error);
        }
      });
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

    this.lessonService.updateLesson(this.lessonId, this.lessonForm.value)
      .subscribe({
        next: (lesson) => {
          console.log('Lesson updated successfully:', lesson);
          this.router.navigate(['/admin/dashboard/lessons-management']);
          this.toastr.success('Lesson updated successfully');

        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to update lesson. Please try again.';
          console.error('Error updating lesson:', error);
          this.toastr.error('Error updating lesson', error.message);
        }
      });
  }
}