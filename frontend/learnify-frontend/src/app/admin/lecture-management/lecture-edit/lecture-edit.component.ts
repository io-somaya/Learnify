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
  styleUrls: ['./lecture-edit.component.css'],
})
export class LectureEditComponent implements OnInit {
  lecture: ILecture | null = null;
  id: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lectureService: LectureService,
    private toster: ToastService
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.lectureService.getLectureById(this.id).subscribe({
      next: (res) => {
        this.lecture = {
          ...res,
          day_of_week: res.day_of_week || '',
          description: res.description || '',
          start_time: this.formatTime(res.start_time),
          end_time: this.formatTime(res.end_time),
          title: res.title || '',
          grade: res.grade || '',
          is_active: res.is_active ? '1' : '0', // Convert boolean to string
        };
        
      },
      error: (err) => console.error(err.message),
    });
  }

  private formatTime(time: string): string {
    if (!time) return '';
    // If time is in HH:mm format, convert to datetime-local format
    if (time.length === 5) {
      const today = new Date();
      const [hours, minutes] = time.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0);
      return today.toISOString().slice(0, 16);
    }
    return time.slice(0, 16);
  }

  onSubmit(): void {
    if (!this.lecture) return;

    const updatedLecture = {
      ...this.lecture,
      start_time: new Date(this.lecture.start_time).toTimeString().slice(0, 5),
      end_time: new Date(this.lecture.end_time).toTimeString().slice(0, 5)
    };

    this.lectureService.updateLecture(this.id, updatedLecture).subscribe({
      next: () => this.router.navigate(['admin/dashboard/lectures-management'])
      .then(() => this.toster.success('Lecture updated successfully')),

      error: (err) => {
        console.error(err.message);
        this.toster.error('Error updating lecture');
      },

    });
  }
}
