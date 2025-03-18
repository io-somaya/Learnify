import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  userId: string = '';
  token: string = '';
  expires: string = '';
  signature: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Extract path parameters
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';

    // Extract query parameters
    this.route.queryParams.subscribe(params => {
      this.expires = params['expires'];
      this.signature = params['signature'];

      // Call the API to verify the email
      if (this.userId && this.token && this.expires && this.signature) {
        this.authService.verifyEmail(this.userId, this.token, this.expires, this.signature).subscribe({
          next: (response) => {
            this.message = response.message; // Set the success message
            this.isLoading = false;
            // setTimeout(() => {
            //   this.router.navigate(['/login']); // Redirect to login after 3 seconds
            // }, 3000);
          },
          error: (error) => {
            this.message = error.error?.message || 'Failed to verify email. Please try again.'; // Set the error message
            this.isError = true;
            this.isLoading = false;
          }
        });
      } else {
        // Invalid link
        this.message = 'Invalid verification link.';
        this.isError = true;
        this.isLoading = false;
      }
    });
  }
}