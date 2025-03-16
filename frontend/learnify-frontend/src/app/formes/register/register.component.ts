import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Import necessary MDB modules
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MdbFormsModule, MdbRippleModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent { 
  registerForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {
    this.registerForm = new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl(null, [Validators.required, Validators.minLength(2)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^\d{10}$/)]),
      parentPhone: new FormControl(null, [Validators.required, Validators.pattern(/^\d{10}$/)]),
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

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = {
        first_name: this.firstName?.value,
        last_name: this.lastName?.value,
        email: this.email?.value,
        phone: this.phone?.value,
        parent_phone: this.parentPhone?.value,
        grade: this.grade?.value,
        password: this.password?.value,
        password_confirmation: this.confirmPassword?.value
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration successful', response);
          alert('Registration successful! Please check your email to verify your account.');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Registration failed. Please try again.';
          console.error('Registration error', error);
        }
      });
    }
  }
}
