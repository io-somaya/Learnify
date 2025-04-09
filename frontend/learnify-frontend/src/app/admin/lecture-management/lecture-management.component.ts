import { Component, OnInit, inject } from '@angular/core';
import { LectureService } from '../../services/lecture.service';
import { ILecture } from '../../Interfaces/ILecture';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-lecture-management',
  standalone: true,
  imports: [CommonModule, RouterModule,TruncatePipe],
  templateUrl: './lecture-management.component.html',
  styleUrls: ['./lecture-management.component.css']
})
export class LectureManagementComponent implements OnInit {
  private lectureService = inject(LectureService);
  private toaster = inject(ToastService);
  lectures: ILecture[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.loadLectures();
  }

  loadLectures() {
    this.isLoading = true;
    this.errorMessage = null;

    this.lectureService.getLectures().subscribe({
      next: (data) => {
        this.lectures = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  deleteLecture(id: number) {
    if (confirm('Are you sure you want to delete this lecture?')) {
      this.lectureService.deleteLecture(id).subscribe({
        next: () => {
          this.loadLectures();
          this.toaster.success('Lecture deleted successfully!');

        },
        error: (err) => {
          this.errorMessage = err.message;
        }
      });
    }
  }
}