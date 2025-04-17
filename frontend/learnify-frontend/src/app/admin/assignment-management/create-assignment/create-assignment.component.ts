import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AssignmentService } from '../../../services/assignment.service';
import { LessonService } from '../../../services/lessons.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-assignment.component.html',
  styleUrls: ['./create-assignment.component.scss']
})
export class CreateAssignmentComponent implements OnInit {
  assignmentForm!: FormGroup;
  lessons: any[] = [];
  grades: string[] = ['1', '2', '3'];
  questionTypes: string[] = ['mcq', 'essay', 'short_answer'];
  isSubmitting = false;
  isLoadingLessons = false;
  totalLessons = 0;
  currentPage = 1;
  perPage = 50; // Load more lessons to avoid pagination
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private lessonService: LessonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLessons();
  }

  initForm(): void {
    this.assignmentForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      grade: ['', [Validators.required]],
      lesson_id: [null],
      questions: this.fb.array([this.createQuestionFormGroup()])
    });
  }

  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      question_text: ['', Validators.required],
      question_type: ['mcq', Validators.required],
      options: this.fb.array([
        this.createOptionFormGroup(),
        this.createOptionFormGroup(),
        this.createOptionFormGroup()
      ]),
      correct_answer: [0, Validators.required]
    });
  }

  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      option_text: ['', Validators.required]
    });
  }

  get questionsFormArray(): FormArray {
    return this.assignmentForm.get('questions') as FormArray;
  }

  getOptionsFormArray(questionIndex: number): FormArray {
    return (this.questionsFormArray.at(questionIndex) as FormGroup).get('options') as FormArray;
  }

  addQuestion(): void {
    this.questionsFormArray.push(this.createQuestionFormGroup());
  }

  removeQuestion(index: number): void {
    if (this.questionsFormArray.length > 1) {
      this.questionsFormArray.removeAt(index);
    }
  }

  addOption(questionIndex: number): void {
    this.getOptionsFormArray(questionIndex).push(this.createOptionFormGroup());
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const optionsArray = this.getOptionsFormArray(questionIndex);
    if (optionsArray.length > 2) {
      // Keep at least 2 options
      optionsArray.removeAt(optionIndex);
      
      // Update correct answer if needed
      const correctAnswerControl = (this.questionsFormArray.at(questionIndex) as FormGroup).get('correct_answer');
      const currentCorrectAnswer = correctAnswerControl?.value;
      
      if (currentCorrectAnswer === optionIndex) {
        // If deleted option was the correct one, set first option as correct
        correctAnswerControl?.setValue(0);
      } else if (currentCorrectAnswer > optionIndex) {
        // Adjust index if deleted option was before correct answer
        correctAnswerControl?.setValue(currentCorrectAnswer - 1);
      }
    }
  }

  loadLessons(page: number = 1): void {
    this.isLoadingLessons = true;
    this.lessonService.getManagedLessons(page, undefined, undefined, this.perPage)
      .pipe(finalize(() => this.isLoadingLessons = false))
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.lessons = [...this.lessons, ...response.data.data];
            this.totalLessons = response.data.total;
            this.currentPage = response.data.current_page;
            
            // Load more lessons if available
            if (response.data.current_page < response.data.last_page) {
              this.loadLessons(response.data.current_page + 1);
            }
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load lessons: ' + error.message;
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.markFormGroupTouched(this.assignmentForm);
      this.errorMessage = 'Please fill all required fields correctly';
      setTimeout(() => this.errorMessage = null, 5000);
      return;
    }

    this.isSubmitting = true;
    const assignmentData = { ...this.assignmentForm.value };
    
    this.assignmentService.createAssignment(assignmentData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Assignment created successfully!';
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['/admin/assignments']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create assignment: ' + error.message;
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  // Helper methods for field validation
  isFieldInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }
  goBack(): void {
    const confirmBack = confirm('Are you sure you want to go back?');
    if (confirmBack) {
      this.router.navigate(['/admin/dashboard/assignments-management']);
    }
  }
}