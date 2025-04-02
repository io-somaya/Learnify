import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

/**
 * Reset Password Component
 * 
 * Allows users to set a new password after requesting a password reset.
 * Accessible through a link sent via email that contains a token and email parameters.
 */
@Component({
    selector: 'app-reset-password',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientModule
    ],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  // Form for password reset
  resetForm: FormGroup;
  
  // UI state flags
  isLoading = false;
  showPassword = false;
  submitAttempted = false;
  
  // Success/error message handling
  successMessage = '';
  errorMessage = '';
  
  // Reset token and email from query params
  token = '';
  email = '';

  /**
   * Constructor initializes dependencies and form
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize form with validation
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      password_confirmation: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * On component initialization, extract token and email from URL query parameters
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      // Show error if parameters are missing
      if (!this.token || !this.email) {
        this.errorMessage = 'Invalid password reset link. Please request a new link.';
      }
    });
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirmation')?.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Form getter for easier template access
   */
  get f() { 
    return this.resetForm.controls; 
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.submitAttempted = true;
    
    // Don't proceed if form is invalid
    if (this.resetForm.invalid) {
      return;
    }
    
    // Don't proceed if token or email is missing
    if (!this.token || !this.email) {
      this.errorMessage = 'Invalid password reset link. Please request a new link.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Get form values
    const password = this.f['password'].value;
    const password_confirmation = this.f['password_confirmation'].value;
    
    // Call AuthService to reset password
    this.authService.resetPassword(
      this.token, 
      this.email, 
      password, 
      password_confirmation
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Your password has been reset successfully.';
        
        // Redirect to login page after short delay
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to reset password. Please try again.';
      }
    });
  }
  
  /**
   * Fallback method for image loading errors
   */
  handleImageError(event: any, fallbackSrc: string): void {
    event.target.src = fallbackSrc;
  }
}
