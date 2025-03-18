import { CommonModule } from '@angular/common';
import { Component, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MdbFormsModule, 
    MdbRippleModule, 
    HttpClientModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy { 
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  private subscriptions: Subscription = new Subscription();
  showPassword: boolean = false;
  isBrowser: boolean;

  // Egyptian phone number regex pattern (starts with 010, 011, 012, or 015 and is 11 digits)
  private phoneRegex = /^(010|011|012|015)[0-9]{8}$/;

  constructor(
    private router: Router, 
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.registerForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl(null, [Validators.required, Validators.minLength(2)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(this.phoneRegex)]),
      parentPhone: new FormControl(null, [Validators.required, Validators.pattern(this.phoneRegex)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      grade: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl(null, [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get phone() { return this.registerForm.get('phone'); }
  get parentPhone() { return this.registerForm.get('parentPhone'); }
  get email() { return this.registerForm.get('email'); }
  get grade() { return this.registerForm.get('grade'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  handleImageError(event: any, fallbackSrc: string) {
    event.target.src = fallbackSrc;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
  
      const userData = {
        first_name: this.firstName?.value,
        last_name: this.lastName?.value,
        email: this.email?.value,
        phone_number: this.phone?.value,
        parent_phone: this.parentPhone?.value,
        grade: this.grade?.value,
        password: this.password?.value,
        password_confirmation: this.confirmPassword?.value
      };
      // console.log("USERDATA",JSON.stringify(userData,null,2));
      const registerSub = this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration successful', response);
          this.router.navigate(['/check-email']); // إعادة التوجيه إلى صفحة التحقق من البريد الإلكتروني
        },
        error: (error) => {
          this.isLoading = false;
          // Display detailed validation errors if available
          if (error.error && error.error.errors) {
            const errorMessages = Object.values(error.error.errors).flat();
            this.errorMessage = errorMessages.join('. ');
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
          console.error('Registration error:', error);
        }
      });
  
      this.subscriptions.add(registerSub);
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // إلغاء جميع الاشتراكات
  }
}