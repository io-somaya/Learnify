import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [NgIf,RouterLink],
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.css']
})
export class CheckEmailComponent {
  email: string ;
  resendLoading: boolean = false;
  resendSuccess: boolean = false;
  resendError: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.email = this.authService.currentUserValue?.email || this.authService.registerEmail ||"";
  }

  resendVerificationEmail(): void {
    if (!this.email) {
      this.resendError = 'Email is required.';
      return;
    }

    this.resendLoading = true;
    this.resendError = '';
    this.resendSuccess = false;

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.resendSuccess = true;
        this.resendLoading = false;
      },
      error: (error) => {
        this.resendError = error.error?.message || 'Failed to resend verification email. Please try again.';
        this.resendLoading = false;
        console.error('Error:', error);
      }
    });
  }
}