import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../services/assignment.service';
import { IAssignment } from '../../../Interfaces/IAssignment';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assignment-list.component.html',
  styleUrl: './assignment-list.component.css'
})
export class AssignmentListComponent implements OnInit {
  assignments: IAssignment[] = [];
  filteredAssignments: IAssignment[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Search and filter properties
  searchTerm: string = '';
  // selectedGrade: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  constructor(private assignmentService: AssignmentService) {}

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.error = null;
    
    this.assignmentService.getAssignmentsForStudent().subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.assignments];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply grade filter
    // if (this.selectedGrade) {
    //   filtered = filtered.filter(assignment => 
    //     assignment.grade.toString() === this.selectedGrade
    //   );
    // }

    this.filteredAssignments = filtered;
    this.totalPages = Math.ceil(this.filteredAssignments.length / this.itemsPerPage);
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onGradeChange(event: any): void {
    // this.selectedGrade = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }

  getCurrentPageItems(): IAssignment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAssignments.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  resetSearch(): void {
    this.searchTerm = '';
    // this.selectedGrade = '';
    this.currentPage = 1;
    this.applyFilters();
  }
}
