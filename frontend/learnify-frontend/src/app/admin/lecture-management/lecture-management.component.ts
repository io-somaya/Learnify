import { Component, OnInit, inject } from '@angular/core';
import { LectureService } from '../../services/lecture.service';
import { ILecture } from '../../Interfaces/ILecture';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { ToastService } from '../../services/toast.service';
import { CustomDateFormatPipe } from '../../pipes/DateFormate.pipe';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lecture-management',
  standalone: true,
  imports: [CommonModule, RouterModule, TruncatePipe, CustomDateFormatPipe, ReactiveFormsModule],
  templateUrl: './lecture-management.component.html',
  styleUrls: ['./lecture-management.component.css']
})
export class LectureManagementComponent implements OnInit {
  private lectureService = inject(LectureService);
  private toaster = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  lectures: ILecture[] = [];
  filteredLectures: ILecture[] = [];
  displayedLectures: ILecture[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  Math = Math;

  // Pagination properties
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  pages: number[] = [];

  // Search and filter
  searchForm: FormGroup;
  grades = [1, 2, 3];

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
      grade: ['']
    });
  }

  ngOnInit() {
    this.loadLectures();
    this.searchForm.valueChanges.subscribe(() => {
      this.filterLectures();
    });
  }

  loadLectures() {
    this.isLoading = true;
    this.errorMessage = null;

    this.lectureService.getLectures().subscribe({
      next: (data) => {
        this.lectures = data;
        this.filteredLectures = [...this.lectures];
        this.updatePagination();
        this.updateDisplayedLectures();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }

  filterLectures(): void {
    const searchTerm = this.searchForm.get('search')?.value?.toLowerCase();
    const selectedGrade = this.searchForm.get('grade')?.value;

    this.filteredLectures = this.lectures.filter(lecture => {
      const matchesSearch = !searchTerm || 
        lecture.title.toLowerCase().includes(searchTerm) ||
        lecture.description.toLowerCase().includes(searchTerm);

      const matchesGrade = !selectedGrade || 
        lecture.grade.toString() === selectedGrade.toString();

      return matchesSearch && matchesGrade;
    });

    this.currentPage = 1;
    this.updatePagination();
    this.updateDisplayedLectures();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLectures.length / this.pageSize);
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  updateDisplayedLectures(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedLectures = this.filteredLectures.slice(startIndex, endIndex);
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.filteredLectures = [...this.lectures];
    this.currentPage = 1;
    this.updatePagination();
    this.updateDisplayedLectures();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updateDisplayedLectures();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedLectures();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedLectures();
    }
  }

  editLecture(id) {
    this.router.navigate(['/admin/dashboard/lectures/edit', id]);
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