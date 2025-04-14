import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LectureService } from '../../../services/lecture.service';
import { ILecture } from '../../../Interfaces/ILecture';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-lecture-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './lecture-edit.component.html',
  styleUrls: ['./lecture-edit.component.css']
})
export class LectureEditComponent implements OnInit {
  lecture: ILecture | null = null;
  id: number;
  isLoading = false;
  error: string | null = null;
  validationErrors: { [key: string]: string[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
    private toaster: ToastService
  ) {}
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  grades = [1, 2, 3];
  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.loadLecture();
  }

  loadLecture(): void {
    this.isLoading = true;
    this.lectureService.getLectureById(this.id).subscribe({
      next: (data) => {
        // Convert HH:mm:ss to HH:mm when loading
        const formattedData = {
          ...data,
          start_time: data.start_time.substring(0, 5), // Take only HH:mm
          end_time: data.end_time.substring(0, 5)      // Take only HH:mm
        };
        this.lecture = formattedData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Load error:', error);
        this.toaster.error('Failed to load lecture');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.lecture) {
      this.toaster.error('No lecture data to update');
      return;
    }

    this.isLoading = true;
    this.validationErrors = {};

    // No need to modify the time format - send as HH:mm
    const payload = {
      title: this.lecture.title,
      description: this.lecture.description,
      day_of_week: this.lecture.day_of_week,
      start_time: this.lecture.start_time,    // Keep as HH:mm
      end_time: this.lecture.end_time,        // Keep as HH:mm
      grade: this.lecture.grade,
      is_active: this.lecture.is_active
    };

    this.lectureService.updateLecture(this.id, payload).subscribe({
      next: () => {
        this.toaster.success('Lecture updated successfully');
        this.router.navigate(['/admin/dashboard/lectures-management']);
      },
      error: (error) => {
        if (error.error?.errors) {
          this.validationErrors = error.error.errors;
          console.log('Validation errors:', this.validationErrors);
        } else if (error.status === 422) {
          this.toaster.error('Invalid time format. Please check the time fields.');
        } else {
          this.toaster.error(error.message || 'Failed to update lecture');
        }
        this.isLoading = false;
      }
    });
  }
}