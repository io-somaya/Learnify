import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { ToastService } from '../../services/toast.service';


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
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Password strength properties
  passwordStrength = {
    hasUpperCase: false,
    hasLowerCase: false, 
    hasNumber: false,
    hasSpecialChar: false
  };
  passwordStrengthLevel = 'weak';
  passwordStrengthText = 'Weak';
  passwordStrengthPercentage = 0;

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private toastr: ToastService, // Assuming you have a ToastrService for notifications
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

  checkPasswordStrength(): void {
    const password = this.passwordForm.get('new_password')?.value;
    
    if (!password) {
      this.resetPasswordStrength();
      return;
    }
    
    // Check for different character types
    this.passwordStrength.hasUpperCase = /[A-Z]/.test(password);
    this.passwordStrength.hasLowerCase = /[a-z]/.test(password);
    this.passwordStrength.hasNumber = /[0-9]/.test(password);
    this.passwordStrength.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Calculate strength score
    const metRequirements = Object.values(this.passwordStrength).filter(val => val).length;
    const lengthScore = password.length >= 12 ? 1 : (password.length >= 8 ? 0.5 : 0);
    
    // Calculate total score (out of 5)
    const totalScore = metRequirements + lengthScore;
    
    // Set strength level
    if (totalScore < 2) {
      this.passwordStrengthLevel = 'weak';
      this.passwordStrengthText = 'Weak';
      this.passwordStrengthPercentage = 25;
    } else if (totalScore < 3) {
      this.passwordStrengthLevel = 'medium';
      this.passwordStrengthText = 'Medium';
      this.passwordStrengthPercentage = 50;
    } else if (totalScore < 4.5) {
      this.passwordStrengthLevel = 'strong';
      this.passwordStrengthText = 'Strong';
      this.passwordStrengthPercentage = 75;
    } else {
      this.passwordStrengthLevel = 'very-strong';
      this.passwordStrengthText = 'Very Strong';
      this.passwordStrengthPercentage = 100;
    }
  }
  
  resetPasswordStrength(): void {
    this.passwordStrength = {
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    };
    this.passwordStrengthLevel = 'weak';
    this.passwordStrengthText = 'Weak';
    this.passwordStrengthPercentage = 0;
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      this.profileService.updatePassword(this.passwordForm.value).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          if (response.status === 200) {
            this.toastr.success('Password updated successfully');
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