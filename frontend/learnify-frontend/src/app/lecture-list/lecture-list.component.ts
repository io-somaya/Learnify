import { Component, OnInit, inject } from '@angular/core';
import { LectureService } from '../services/lecture.service';
import { ILecture } from '../Interfaces/ILecture';
import { CommonModule } from '@angular/common';
import { CustomDateFormatPipe } from '../pipes/DateFormate.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lecture-list',
  standalone: true,
  imports: [CommonModule, CustomDateFormatPipe, FormsModule],
  templateUrl: './lecture-list.component.html',
  styleUrls: ['./lecture-list.component.css']
})
export class LectureListComponent implements OnInit {
  private lectureService = inject(LectureService);
  lectures: ILecture[] = [];
  filteredLectures: ILecture[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  searchQuery: string = '';

  ngOnInit() {
    this.loadLectures();
  }

  loadLectures() {
    this.isLoading = true;
    this.errorMessage = null;

    this.lectureService.getLecturesStudent().subscribe({
      next: (data) => {
        this.lectures = data;
        this.filteredLectures = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  searchLectures(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.toLowerCase().trim();
    
    if (!this.searchQuery) {
      this.filteredLectures = [...this.lectures];
      return;
    }
    
    this.filteredLectures = this.lectures.filter(lecture => 
      lecture.title.toLowerCase().includes(this.searchQuery) ||
      lecture.description.toLowerCase().includes(this.searchQuery) ||
      lecture.day_of_week.toLowerCase().includes(this.searchQuery)
    );
  }
}
