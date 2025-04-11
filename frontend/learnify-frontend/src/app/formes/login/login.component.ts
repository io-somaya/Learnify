import { Component, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

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
    private toastService: ToastService,
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
          
          // Show success toast message
          this.toastService.success('Login completed successfully!');
          
          // Get user role
          const userRole = response.user?.role || this.authService.userRole;
          
          // Handle different user roles
          if (userRole === 'teacher' || userRole === 'assistant') {
            // If a teacher/admin tries to log in through the student form
            this.toastService.info('Please use the admin login page for teacher/admin access');
            this.router.navigate(['/admin/login']);
          } else {
            // All other users (including students) go to student dashboard
            this.router.navigate(['/student/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
          console.error('Login error', error);
          // show toast message
          this.toastService.error(this.errorMessage);
        }
      });
    }
  }

  forgotPassword() {
    if (!this.isBrowser) return;
    
    // Navigate to forgot password page
    this.router.navigate(['/forgot-password']);
  }
  
  goToAdminLogin() {
    this.router.navigate(['/admin/login']);
  }
} 