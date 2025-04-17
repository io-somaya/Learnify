import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { IAssignmentDetail } from '../../../Interfaces/IAssignment';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css'
})
export class AssignmentDetailComponent implements OnInit {
  assignmentDetail?: IAssignmentDetail;
  loading = true;
  error = '';
  currentPage = 1;
  totalPages = 1;
  assignmentId = 0;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.assignmentId = id;
      this.loadAssignment(id, this.currentPage);
    }
  }

  private loadAssignment(id: number, page: number): void {
    this.loading = true;
    this.assignmentService.getAssignmentById(id, page).subscribe({
      next: (data) => {
        this.assignmentDetail = data;
        this.totalPages = data.questions.last_page;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadAssignment(this.assignmentId, page);
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard/assignments-management']);
  }
  
}
