import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.css']
})
export class PasswordChangeComponent implements OnInit {
  passwordForm!: FormGroup;
  isSubmitting = false;
  error = '';
  successMessage = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.passwordForm = this.formBuilder.group({
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('new_password_confirmation')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('new_password_confirmation')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
      this.error = '';
      this.successMessage = '';

      this.profileService.updatePassword(this.passwordForm.value).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          if (response.status === 200) {
            this.successMessage = 'Password updated successfully';
            this.passwordForm.reset();
            setTimeout(() => this.router.navigate(['/admin/dashboard/profile']), 2000);
          } else {
            this.error = response.message || 'Unexpected response format';
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.message || 'Failed to update password';
          if (err.errors && err.errors.current_password) {
            this.error = 'Current password is incorrect';
          }
        }
      });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    if (field.errors['mismatch']) return 'Passwords do not match';

    return 'Invalid value';
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'current_password') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new_password') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'new_password_confirmation') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard/profile']);
  }
} 