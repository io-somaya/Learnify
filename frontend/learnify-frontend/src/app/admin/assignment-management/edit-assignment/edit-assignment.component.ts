import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AssignmentService } from '../../../services/assignment.service';
import { LessonService } from '../../../services/lessons.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';
import { IAssignmentDetail, IQuestion } from '../../../Interfaces/IAssignment';

@Component({
  selector: 'app-edit-assignment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-assignment.component.html',
  styleUrls: ['./edit-assignment.component.scss']
})
export class EditAssignmentComponent implements OnInit {
  assignmentForm!: FormGroup;
  lessons: any[] = [];
  grades: string[] = ['1', '2', '3'];
  questionTypes: string[] = ['mcq'];
  
  assignmentId: number = 0;
  assignment: IAssignmentDetail | null = null;
  
  isSubmitting = false;
  isLoading = false;
  isLoadingLessons = false;
  totalLessons = 0;
  currentPage = 1;
  perPage = 1000; // Load more lessons to avoid pagination
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private lessonService: LessonService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initEmptyForm();
    this.loadLessons();
    
    // Get assignment ID from route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.assignmentId = +params['id']; // Convert to number with +
        this.loadAssignment(this.assignmentId);
      }
    });
  }

  initEmptyForm(): void {
    this.assignmentForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      grade: ['', [Validators.required]],
      lesson_id: [null],
      questions: this.fb.array([])
    });
  }

  loadAssignment(id: number): void {
    this.isLoading = true;
    this.assignmentService.getAssignmentById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (assignmentDetail) => {
          this.assignment = assignmentDetail;
          this.populateForm(assignmentDetail);
        },
        error: (error) => {
          this.errorMessage = 'Failed to load assignment: ' + error.message;
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
  }

  populateForm(assignmentDetail: IAssignmentDetail): void {
    // Reset the form with basic assignment details
    this.assignmentForm.patchValue({
      title: assignmentDetail.assignment.title,
      description: assignmentDetail.assignment.description,
      grade: assignmentDetail.assignment.grade,
      lesson_id: assignmentDetail.assignment.lesson?.id || null
    });

    // Clear the questions array before adding loaded questions
    while (this.questionsFormArray.length) {
      this.questionsFormArray.removeAt(0);
    }

    // Add each question to the form
    assignmentDetail.questions.data.forEach(question => {
      this.addExistingQuestion(question);
    });

    // If no questions were loaded, add an empty one
    if (this.questionsFormArray.length === 0) {
      this.addQuestion();
    }
  }

  addExistingQuestion(question: IQuestion): void {
    // Create question form group
    const questionGroup = this.fb.group({
      id: [question.id],
      question_text: [question.question_text, Validators.required],
      question_type: [question.question_type, Validators.required],
      options: this.fb.array([]),
      correct_answer: [null as number | null, Validators.required]  // Explicitly type as number|null
    });
  
    // Get the options form array for this question
    const optionsArray = questionGroup.get('options') as FormArray;
    
    // Add each option and mark the correct one
    question.options.forEach((option, index) => {
      optionsArray.push(this.fb.group({
        id: [option.id],
        option_text: [option.option_text, Validators.required]
      }));
      
      // Set correct answer based on is_correct flag with proper type assertion
      if (option.is_correct === 1) {
        questionGroup.get('correct_answer')?.setValue(index as number);
      }
    });
    
  
    // If there are no options, add default ones
    if (optionsArray.length === 0) {
      optionsArray.push(this.createOptionFormGroup());
      optionsArray.push(this.createOptionFormGroup());
      optionsArray.push(this.createOptionFormGroup());
    }
  
    // Add the question to the questions form array
    this.questionsFormArray.push(questionGroup);
  }
  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      id: [null], // null for new questions
      question_text: ['', Validators.required],
      question_type: ['mcq', Validators.required],
      options: this.fb.array([
        this.createOptionFormGroup(),
        this.createOptionFormGroup(),
        this.createOptionFormGroup()
      ]),
      correct_answer: [null as number | null, Validators.required]  // Explicitly type as number|null
    });
  }

  createOptionFormGroup(): FormGroup {
    return this.fb.group({
      id: [null], // null for new options
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
    
    // Extract basic assignment data
    const assignmentData: any = {
      title: this.assignmentForm.get('title')?.value,
      description: this.assignmentForm.get('description')?.value,
      grade: this.assignmentForm.get('grade')?.value,
      lesson_id: this.assignmentForm.get('lesson_id')?.value
    };
    
    // Format questions properly for API
    if (this.questionsFormArray.length > 0) {
      assignmentData.questions = this.questionsFormArray.controls.map((questionControl: AbstractControl) => {
        const question = questionControl as FormGroup;
        const questionData: any = {
          question_text: question.get('question_text')?.value,
          question_type: question.get('question_type')?.value
        };
        
        // Include question ID only if it exists (for editing existing questions)
        const questionId = question.get('id')?.value;
        if (questionId) {
          questionData.id = questionId;
        }
        
        // Format options
        const optionsArray = question.get('options') as FormArray;
        questionData.options = optionsArray.controls.map((optionControl: AbstractControl) => {
          const option = optionControl as FormGroup;
          const optionData: any = {
            option_text: option.get('option_text')?.value
          };
          
          // Include option ID if it exists
          const optionId = option.get('id')?.value;
          if (optionId) {
            optionData.id = optionId;
          }
          
          return optionData;
        });
        
        // Set the correct answer index
        questionData.correct_answer = question.get('correct_answer')?.value;
        
        return questionData;
      });
    }
    
    this.assignmentService.updateAssignment(this.assignmentId, assignmentData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.successMessage = 'Assignment updated successfully!';
          this.toastService.success('Assignment updated successfully');
          setTimeout(() => {
            this.successMessage = null;
            this.router.navigate(['/admin/dashboard/assignments-management']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update assignment: ' + error.message;
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
    const confirmBack = confirm('Are you sure you want to go back? Any unsaved changes will be lost.');
    if (confirmBack) {
      this.router.navigate(['/admin/dashboard/assignments-management']);
    }
  }
}