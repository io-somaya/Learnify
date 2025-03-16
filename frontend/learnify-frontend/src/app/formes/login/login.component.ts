import { Component, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  isBrowser: boolean;
  
  // Single image with fallback
  images = [
    { 
      src: 'assets/pics/login.png', 
      alt: 'Login',
      fallback: 'https://via.placeholder.com/500x500.png?text=Login'
    }
  ];
  currentImageIndex = 0;
  carouselInterval: any;

  constructor(
    private router: Router, 
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rememberMe: new FormControl(false)
    });
  }

  ngOnInit() {
    // Carousel disabled since we're using a static image
    /*
    if (this.isBrowser) {
      this.startCarousel();
    }
    */
  }

  ngOnDestroy() {
    // Clear the carousel interval when component is destroyed
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextImage();
    }, 5000); // Change image every 5 seconds
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  // Handle image loading errors
  handleImageError(event: any, fallbackSrc: string) {
    event.target.src = fallbackSrc;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login successful', response);
          // Navigate to dashboard
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
          console.error('Login error', error);
        }
      });
    }
  }

  forgotPassword() {
    if (!this.isBrowser) return;
    
    const email = this.loginForm.get('email')?.value;
    if (email) {
      this.isLoading = true;
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Password reset link has been sent to your email.');
        },
        error: (error) => {
          this.isLoading = false;
          alert(error.message || 'Failed to send reset link. Please try again.');
        }
      });
    } else {
      alert('Please enter your email address first.');
      // Focus on email field
      document.getElementById('email')?.focus();
    }
  }
} 