import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgClass],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  status: string = '';
  userId: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Extract query parameters
    this.route.queryParams.subscribe(params => {
      this.status = params['status'];
      this.userId = params['userId'];

      // Add a slight delay to show loading animation
      setTimeout(() => {
        // Process based on status parameter
        if (this.status === 'success') {
          this.message = 'Your email has been successfully verified! You can now enjoy full access to your account.';
          this.isError = false;
          
          setTimeout(() => {
            this.goToLogin();
          }, 5000);
        } 
        else if (this.status === 'error') {
          this.message = 'There was an error verifying your email. Please try again later.';
          this.isError = true;
        } 
        else if (this.status === 'already_verified') {
          this.message = 'Your email is already verified. You can log in now.';
          this.isError = false;
        }
        else {
          this.message = 'We couldn\'t verify your email address. The verification link may have expired or is invalid. Please try requesting a new verification link. Or this email is already verified.';
          this.isError = true;
        }
        this.isLoading = false;
      }, 1500); // Longer delay to showcase the loading animation
    });
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }
}