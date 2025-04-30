import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LectureService } from '../../../services/lecture.service';
import { ILecture } from '../../../Interfaces/ILecture';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-lecture-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lecture-edit.component.html',
  styleUrls: ['./lecture-edit.component.css']
})
export class LectureEditComponent implements OnInit {
  lecture: ILecture | null = null;
  id: number;
  isLoading = false;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  lectureForm: FormGroup;
  validationErrors: { [key: string]: string[] } = {};

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  gradeLevels = ['1', '2', '3'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
    private toaster: ToastService,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.loadLecture();
  }

  // Create form with validation
  createForm(): void {
    this.lectureForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      active: [true]
    });
  }

  // Getter for form controls
  get f() {
    return this.lectureForm.controls;
  }

  loadLecture(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.lectureService.getLectureById(this.id).subscribe({
      next: (data) => {
        this.lecture = data;
        this.isLoading = false;
        
        // Update form with lecture data
        this.lectureForm.patchValue({
          title: data.title,
          description: data.description,
          dayOfWeek: data.day_of_week,
          startTime: data.start_time.substring(0, 5), // Take only HH:mm
          endTime: data.end_time.substring(0, 5),     // Take only HH:mm
          gradeLevel: data.grade,
          active: data.is_active === '1' || String(data.is_active) === 'true'
        });
      },
      error: (error) => {
        console.error('Load error:', error);
        this.errorMessage = 'Failed to load lecture: ' + (error.message || 'Unknown error');
        this.toaster.error('Failed to load lecture');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = null;
    this.errorMessage = null;
    
    // Stop if form is invalid
    if (this.lectureForm.invalid) {
      return;
    }

    this.loading = true;

    const payload: ILecture = {
      title: this.f['title'].value,
      description: this.f['description'].value,
      day_of_week: this.f['dayOfWeek'].value,
      start_time: this.f['startTime'].value,
      end_time: this.f['endTime'].value,
      grade: this.f['gradeLevel'].value,
      is_active: this.f['active'].value ? '1' : '0'
    };

    this.lectureService.updateLecture(this.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Lecture updated successfully!';
        this.toaster.success('Lecture updated successfully');
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard/lectures-management']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        if (error.error?.errors) {
          this.validationErrors = error.error.errors;
          console.log('Validation errors:', this.validationErrors);
          this.errorMessage = 'Please correct the errors in the form.';
        } else if (error.status === 422) {
          this.errorMessage = 'Invalid time format. Please check the time fields.';
        } else {
          this.errorMessage = error.message || 'Failed to update lecture';
        }
        this.toaster.error("Failed to update lecture check Start time and End time ");
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/dashboard/lectures-management']);
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this lecture?')) {
      this.loading = true;
      this.lectureService.deleteLecture(this.id).subscribe({
        next: () => {
          this.toaster.success('Lecture deleted successfully');
          this.router.navigate(['/admin/dashboard/lectures-management']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to delete lecture: ' + (error.message || 'Unknown error');
          this.toaster.error(this.errorMessage);
        }
      });
    }
  }
}