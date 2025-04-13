import { Component, OnInit } from '@angular/core';
import { LessonService } from '../../services/lessons.service';
import { ILesson } from '../../Interfaces/ILesson';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.scss']
})
export class LessonListComponent implements OnInit {
  lessons: ILesson[] = [];
  isLoading = false;
  errorMessage = '';
  searchForm: FormGroup;
  grades = ['1', '2', '3'];
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  totalPages = 1;

  constructor(
    private lessonService: LessonService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      grade: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadLessons();

    // Setup search with debounce
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset to first page when searching
        this.loadLessons();
      });
  }

  loadLessons(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const grade = this.searchForm.get('grade')?.value;
    const search = this.searchForm.get('search')?.value;

    this.lessonService.getLessons(this.currentPage, grade, search, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.lessons = response.data;
          this.totalItems = response.total;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
  }

  // viewLesson(id: number): void {
  //   this.router.navigate(['/student/dashboard/lessons', id]);
  // }
  viewLesson(id: number): void {
    this.router.navigate(['/lessons', id]);
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadLessons();
    window.scrollTo(0, 0); // Optional: scroll to top
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5; // Show max 5 page numbers
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}