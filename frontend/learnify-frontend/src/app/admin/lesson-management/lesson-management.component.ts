import { Component, OnInit } from '@angular/core';
import { LessonService } from '../../services/lessons.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ILesson } from '../../Interfaces/ILesson';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lesson-management',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './lesson-management.component.html',
  styleUrls: ['./lesson-management.component.scss']
})
export class LessonManagementComponent implements OnInit {
  lessons: ILesson[] = [];
  paginationInfo = {
    currentPage: 1,  // Changed from 0 to 1
    lastPage: 1,
    total: 0,
    perPage: 10,
    links: []
  };
  isLoading = false;
  errorMessage = '';
  searchForm: FormGroup;
  grades = ['1', '2', '3'];

  constructor(
    private lessonService: LessonService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      grade: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadLessonsData(1);

    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => this.loadLessonsData(1));

    this.searchForm.get('grade')?.valueChanges
      .subscribe(() => this.loadLessonsData(1));
  }

  loadLessonsData(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const grade = this.searchForm.get('grade')?.value;
    const search = this.searchForm.get('search')?.value;
  
    this.lessonService.getManagedLessons(page, grade, search)
      .subscribe({
        next: (response) => {
          this.lessons = response.data.data || [];
          this.paginationInfo = {
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
            links: response.data.links
          };
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
  }

  getDisplayRange(): string {
    if (!this.paginationInfo || this.paginationInfo.total === 0) {
      return 'No entries found';
    }

    const start = ((this.paginationInfo.currentPage - 1) * this.paginationInfo.perPage) + 1;
    const end = Math.min(
      this.paginationInfo.currentPage * this.paginationInfo.perPage,
      this.paginationInfo.total
    );
    
    return `Showing ${start} to ${end} of ${this.paginationInfo.total} entries`;
  }

  changePage(page: number): void {
    if (page === this.paginationInfo.currentPage) return;
    this.loadLessonsData(page);
  }

  getYoutubeThumbnail(embedCode: string): string {
    if (!embedCode) return '';
    const match = embedCode.match(/embed\/([^?]+)/);
    return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : '';
  }

  // New method to generate page numbers
  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.paginationInfo.lastPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}