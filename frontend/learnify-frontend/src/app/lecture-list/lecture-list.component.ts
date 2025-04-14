import { Component, OnInit, inject } from '@angular/core';
import { LectureService } from '../services/lecture.service';
import { ILecture } from '../Interfaces/ILecture';
import { CommonModule } from '@angular/common';
import { CustomDateFormatPipe } from '../pipes/DateFormate.pipe';

@Component({
  selector: 'app-lecture-list',
  standalone: true,
  imports: [CommonModule, CustomDateFormatPipe],
  templateUrl: './lecture-list.component.html',
  styleUrls: ['./lecture-list.component.css']
})
export class LectureListComponent implements OnInit {
  private lectureService = inject(LectureService);
  lectures: ILecture[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.loadLectures();
  }

  loadLectures() {
    this.isLoading = true;
    this.errorMessage = null;

    this.lectureService.getLecturesStudent().subscribe({
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
}
