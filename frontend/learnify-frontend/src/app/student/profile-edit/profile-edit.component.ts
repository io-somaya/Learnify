import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUserProfile } from '../../Interfaces/IUserProfile';
import { ProfileService } from '../../services/profile.service';
import { ToastService } from '../../services/toast.service';

interface ApiResponse {
  status: number;
  message: string;
  data: IUserProfile;
}

@Component({
  selector: 'app-student-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class StudentProfileEditComponent implements OnInit {
  profileForm!: FormGroup;
  user: IUserProfile | null = null;
  isLoading = true;
  isSubmitting = false;
  error = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fetchProfile();
  }

  initForm(): void {
    this.profileForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]]
    });
  }

  fetchProfile(): void {
    this.isLoading = true;
    this.error = '';
    
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        if (response.data) {
          this.user = response.data;
          this.populateForm();
        } else if (response) {
          this.user = response;
          this.populateForm();
        } else {
          this.error = 'Unexpected response format';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load profile';
        this.isLoading = false;
        this.toastService.error('Failed to load profile data');
      }
    });
  }

  populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        email: this.user.email,
        phone_number: this.user.phone_number
      });
      
      // Mark the form as pristine after initial population
      this.profileForm.markAsPristine();
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      this.error = '';
      this.successMessage = '';

      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          if (response.status === 200 || response.success) {
            this.successMessage = 'Profile updated successfully';
            this.toastService.success('Profile updated successfully');
            // Update the local user data
            if (this.user) {
              this.user = { ...this.user, ...this.profileForm.value };
            }
            this.profileForm.markAsPristine();
            setTimeout(() => this.router.navigate(['/student/dashboard/profile']), 2000);
          } else {
            this.error = response.message || 'Unexpected response format';
            this.toastService.error(this.error);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.message || 'Failed to update profile';
          this.toastService.error(this.error);
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['pattern']) return 'Invalid phone number format';

    return 'Invalid value';
  }
  
  navigateToPasswordChange(): void {
    this.router.navigate(['/student/dashboard/profile/password']);
  }
  
  navigateToPhotoUpload(): void {
    this.router.navigate(['/student/dashboard/profile/photo']);
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard/profile']);
  }
} 