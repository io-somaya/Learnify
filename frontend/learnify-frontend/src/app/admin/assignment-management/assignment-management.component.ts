import { Component, OnInit } from '@angular/core';
import { AssignmentService } from '../../services/assignment.service';
import { IAssignment } from '../../Interfaces/IAssignment';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-assignment-management',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TruncatePipe],
  templateUrl: './assignment-management.component.html',
  styleUrls: ['./assignment-management.component.css']
})
export class AssignmentManagementComponent implements OnInit {
  assignments: IAssignment[] = [];
  displayedAssignments: IAssignment[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  pages: number[] = [];

  // Add Math to your class properties
  Math = Math;

  searchForm: FormGroup;
  filteredAssignments: IAssignment[] = [];
  grades = [1, 2, 3]; // Available grades

  constructor(
    private assignmentService: AssignmentService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [''],
      grade: ['']
    });
  }

  ngOnInit(): void {
    this.loadAssignments();
    
    // Subscribe to form changes
    this.searchForm.valueChanges.subscribe(() => {
      this.filterAssignments();
    });
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.assignmentService.getAssignments().subscribe({
      next: (response) => {
        this.assignments = response;
        this.filteredAssignments = [...this.assignments];
        this.totalPages = Math.ceil(this.assignments.length / this.pageSize);
        this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
        this.updateDisplayedAssignments();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  filterAssignments(): void {
    const searchTerm = this.searchForm.get('search')?.value.toLowerCase();
    const selectedGrade = this.searchForm.get('grade')?.value;

    this.filteredAssignments = this.assignments.filter(assignment => {
      const matchesSearch = !searchTerm || 
        assignment.title.toLowerCase().includes(searchTerm) ||
        assignment.description.toLowerCase().includes(searchTerm);

      const matchesGrade = !selectedGrade || 
        assignment.grade.toString() === selectedGrade.toString();

      return matchesSearch && matchesGrade;
    });

    // Update pagination after filtering
    this.totalPages = Math.ceil(this.filteredAssignments.length / this.pageSize);
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
    this.currentPage = 1;
    this.updateDisplayedAssignments();
  }

  updateDisplayedAssignments(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedAssignments = this.filteredAssignments.slice(startIndex, endIndex);
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.filteredAssignments = this.assignments;
    this.updateDisplayedAssignments();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updateDisplayedAssignments();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedAssignments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedAssignments();
    }
  }
  goToCreateAssignment(): void {
    this.router.navigate(['/admin/dashboard/assignments/add']);
  }
  viewAssignment(id: number): void {
    this.router.navigate(['/admin/dashboard/assignment', id]);
  }

  editAssignment(id: number): void {
    this.router.navigate(['/admin/assignments/edit', id]);
  }

  deleteAssignment(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      this.assignmentService.deleteAssignment(id).subscribe({
        next: () => {
          this.loadAssignments();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }
}