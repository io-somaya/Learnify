import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { FormsModule } from '@angular/forms';

interface ISubmission {
  first_name: string;
  last_name: string;
  score: string | null;
  status: string;
  student_email: string;
  student_id: number;
  submission_id: number;
  submitted_at: string;
}

interface ISubmissionResponse {
  data: ISubmission[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

@Component({
  selector: 'app-assignment-submissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './assignment-submissions.component.html',
  styleUrl: './assignment-submissions.component.css'
})
export class AssignmentSubmissionsComponent implements OnInit {
  submissions: ISubmission[] = [];
  filteredSubmissions: ISubmission[] = [];
  displayedColumns: string[] = ['student', 'email', 'status', 'score', 'submitted_at'];
  isLoading = false;
  hasError = false;
  currentPage = 1;
  totalItems = 0;
  pageSize = 5;
  assignmentId!: number;
  searchTerm = '';
  statusFilter = ''; // New status filter property
  sortColumn = 'submitted_at';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assignmentId = +params['id'];
      this.loadSubmissions();
    });
  }

  loadSubmissions(page: number = 1): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.assignmentService.getSubmissions(this.assignmentId, page, this.pageSize, this.statusFilter)
      .subscribe({
        next: (response: ISubmissionResponse) => {
          this.submissions = response.data;
          this.totalItems = response.meta.total;
          this.currentPage = response.meta.current_page;
          this.isLoading = false;
          
          // Apply any existing search filter or sorts
          this.applyFiltersAndSort();
        },
        error: (error) => {
          console.error('Error loading submissions:', error);
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  applySearch(): void {
    // For text search, we filter in-memory without reloading from server
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  applyStatusFilter(): void {
    // For status filter, we reload from server with new filter
    this.currentPage = 1;
    this.loadSubmissions(this.currentPage);
  }

  applyFiltersAndSort(): void {
    // Filter by search term
    let filtered = this.submissions;
    
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(submission => {
        const fullName = `${submission.first_name} ${submission.last_name}`.toLowerCase();
        const email = submission.student_email.toLowerCase();
        
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Sort the results
    filtered.sort((a, b) => {
      const multiplier = this.sortDirection === 'asc' ? 1 : -1;
      
      switch (this.sortColumn) {
        case 'student':
          const nameA = `${a.first_name} ${a.last_name}`;
          const nameB = `${b.first_name} ${b.last_name}`;
          return multiplier * nameA.localeCompare(nameB);
        case 'email':
          return multiplier * a.student_email.localeCompare(b.student_email);
        case 'status':
          return multiplier * a.status.localeCompare(b.status);
        case 'score':
          const scoreA = a.score !== null ? parseFloat(a.score) : -1;
          const scoreB = b.score !== null ? parseFloat(b.score) : -1;
          return multiplier * (scoreA - scoreB);
        case 'submitted_at':
          const dateA = new Date(a.submitted_at).getTime();
          const dateB = new Date(b.submitted_at).getTime();
          return multiplier * (dateA - dateB);
        default:
          return 0;
      }
    });

    this.filteredSubmissions = filtered;
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction if clicking on the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to descending for new column
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    
    this.applyFiltersAndSort();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.loadSubmissions(page);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getPaginationRange(): number[] {
    const totalPages = this.getTotalPages();
    const range: number[] = [];
    
    // Show up to 5 pages
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }
}