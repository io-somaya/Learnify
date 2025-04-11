import { Component, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  isBrowser: boolean;
  
  // Single image with fallback
  images = [
    { 
      src: 'assets/pics/admin-login.png', 
      alt: 'Admin Login',
      fallback: 'https://via.placeholder.com/500x500.png?text=Admin+Login'
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
      
      this.authService.adminLogin(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          const userRole = response.user?.role || this.authService.userRole;
          
          // Verify user is a teacher or assistant
          if (userRole === 'teacher' || userRole === 'assistant') {
            // Success message
            this.toastService.success('Admin login successful!');
            // Navigate to admin dashboard
            this.router.navigate(['/admin/dashboard']);
          } else {
            // Not authorized as admin
            this.errorMessage = 'You do not have permission to access the admin area.';
            this.toastService.error(this.errorMessage);
            // Logout the user
            this.authService.logout();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Invalid credentials. This login is for administrators only.';
          console.error('Login error', error);
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
  
  // Navigate back to the regular student login page
  goToStudentLogin() {
    this.router.navigate(['/']);
  }
} 