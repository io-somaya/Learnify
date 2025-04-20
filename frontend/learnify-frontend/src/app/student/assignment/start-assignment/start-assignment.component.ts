import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { IAssignment } from '../../../Interfaces/IAssignment';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-start-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-assignment.component.html',
  styleUrl: './start-assignment.component.css'
})
export class StartAssignmentComponent implements OnInit {
  assignment: IAssignment | null = null;
  questions: any[] = [];
  selectedAnswers: Map<number, number> = new Map();
  loading = false;
  error = '';
  submitting = false;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    if (assignmentId) {
      this.loadAssignment(assignmentId);
    }
  }

  private loadAssignment(assignmentId: number) {
    this.loading = true;
    this.assignmentService.getAssignmentsWithOutCorrectAnswer(assignmentId)
      .subscribe({
        next: (assignment) => {
          this.assignment = assignment;
          
          // Ensure questions is always an array
          if (assignment && assignment.questions) {
            if ('data' in assignment.questions && Array.isArray(assignment.questions.data)) {
              this.questions = assignment.questions.data;
            } else if (Array.isArray(assignment.questions)) {
              this.questions = assignment.questions;
            } else {
              console.warn('Unexpected questions format:', assignment.questions);
              this.questions = [];
            }
          } else {
            this.questions = [];
          }
          
          this.loading = false;
          console.log('Loaded assignment:', this.assignment);
          console.log('Questions:', this.questions);
        },
        error: (error) => {
          this.error = 'Failed to load assignment';
          this.loading = false;
          console.error('Load assignment error:', error);
        }
      });
  }

  selectAnswer(questionId: number, optionId: number) {
    this.selectedAnswers.set(questionId, optionId);
    console.log('Selected answers:', Array.from(this.selectedAnswers.entries()));
  }

  isOptionSelected(questionId: number, optionId: number): boolean {
    return this.selectedAnswers.get(questionId) === optionId;
  }

  submitAssignment() {
    if (!this.assignment) {
      this.error = 'Assignment data is missing';
      return;
    }
    
    if (this.selectedAnswers.size === 0) {
      this.error = 'Please answer at least one question before submitting';
      return;
    }

    if (this.selectedAnswers.size !== this.questions.length) {
      this.error = 'Please answer all questions before submitting';
      return;
    }

    this.error = '';
    if (this.submitting) return;
    
    this.submitting = true;
    this.loading = true;

    const answers = Array.from(this.selectedAnswers.entries()).map(([question_id, option_id]) => ({
      question_id,
      option_id
    }));

    console.log('Submitting answers:', answers);
    
    this.assignmentService.submitAssignment(this.assignment.id, answers)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.submitting = false;
          console.log('Submission successful:', response);
          this.toastService.success(`Correct answers!${response.correct_answers}`);
          this.toastService.info(`Assignment score!${response.grade}`);
          this.toastService.error(`Total questions!${response.total_questions}`);
          // this.router.navigate(['/student/assignments/results', this.assignment?.id]);
        },
        error: (error) => {
          this.loading = false;
          this.submitting = false;
          this.error = error.message || 'Failed to submit assignment';
          console.error('Submission error:', error);
        }
      });
  }
}