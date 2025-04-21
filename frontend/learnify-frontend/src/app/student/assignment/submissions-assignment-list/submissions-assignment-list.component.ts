import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../services/assignment.service';
import { ISubmissionStudent } from '../../../Interfaces/ISubmission';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-submissions-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './submissions-assignment-list.component.html',
  styleUrl: './submissions-assignment-list.component.css'
})
export class SubmissionsAssignmentListComponent implements OnInit {
  submissions: ISubmissionStudent[] = [];
  filteredSubmissions: ISubmissionStudent[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalItems: number = 0;

  constructor(private assignmentService: AssignmentService) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadSubmissions();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterSubmissions(searchTerm);
    });
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  private filterSubmissions(searchTerm: string): void {
    searchTerm = searchTerm.toLowerCase().trim();
    this.filteredSubmissions = this.submissions.filter(submission =>
      submission.assignment.title.toLowerCase().includes(searchTerm) ||
      submission.assignment.description.toLowerCase().includes(searchTerm) ||
      submission.status.toLowerCase().includes(searchTerm)
    );
    this.totalItems = this.filteredSubmissions.length;
    this.currentPage = 1;
  }

  loadSubmissions(): void {
    this.assignmentService.getAssignmentsSubmissionsForStudent()
      .subscribe({
        next: (data) => {
          this.submissions = data;
          this.filteredSubmissions = [...this.submissions];
          this.totalItems = this.filteredSubmissions.length;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  get paginatedSubmissions(): ISubmissionStudent[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSubmissions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number[] {
    const pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages.length) {
      this.currentPage = page;
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'graded':
        return 'status-graded';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getPerformanceClass(score: string): string {
    const numericScore = parseFloat(score);
    if (numericScore >= 90) return 'excellent';
    if (numericScore >= 75) return 'good';
    if (numericScore >= 60) return 'average';
    return 'needs-improvement';
  }

  getPerformanceLabel(score: string): string {
    const numericScore = parseFloat(score);
    if (numericScore >= 90) return 'Excellent';
    if (numericScore >= 75) return 'Good';
    if (numericScore >= 60) return 'Average';
    return 'Needs Improvement';
  }
}
