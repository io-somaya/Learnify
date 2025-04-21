import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { ISubmissionDetail } from '../../../Interfaces/ISubmissionDetail';

@Component({
  selector: 'app-assignmemt-submission-detail',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './assignmemt-submission-detail.component.html',
  styleUrl: './assignmemt-submission-detail.component.css'
})
export class AssignmemtSubmissionDetailComponent implements OnInit {
  submissionDetail?: ISubmissionDetail;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit(): void {
    const assignmentId = this.route.snapshot.params['id'];
    if (assignmentId) {
      this.loadSubmissionDetail(assignmentId);
    }
  }

  private loadSubmissionDetail(assignmentId: number): void {
    this.assignmentService.getAssignmentsSubmissionsForStudentByAssignmentId(assignmentId)
      .subscribe({
        next: (data) => {
          this.submissionDetail = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard/assignment-submissions']);
  }
}
