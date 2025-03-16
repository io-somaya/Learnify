import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private tokenExpirationTimer: any;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    let storedUser = null;
    
    if (this.isBrowser) {
      storedUser = localStorage.getItem('currentUser');
    }
    
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Store user details and token in local storage
          if (response && response.token && this.isBrowser) {
            const user = {
              email: email,
              token: response.token,
              expiresIn: response.expires_in || 3600 // Default to 1 hour if not provided
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            
            // Set auto logout timer
            this.autoLogout(user.expiresIn * 1000);
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed. Please try again.'));
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
  }

  logout() {
    // Call the logout API if needed
    if (this.currentUserValue) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.currentUserValue.token}`
        })
      }).subscribe({
        next: () => this.handleLogout(),
        error: () => this.handleLogout()
      });
    } else {
      this.handleLogout();
    }
  }

  private handleLogout() {
    // Clear user from local storage
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject.next(null);
    
    // Clear the auto logout timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
    
    // Redirect to login page
    this.router.navigate(['/']);
  }

  private autoLogout(expirationDuration: number) {
    if (this.isBrowser) {
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
      }, expirationDuration);
    }
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        catchError(error => {
          console.error('Forgot password error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to send reset link. Please try again.'));
        })
      );
  }

  resetPassword(token: string, email: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, {
      token,
      email,
      password,
      password_confirmation
    }).pipe(
      catchError(error => {
        console.error('Reset password error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to reset password. Please try again.'));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  resendVerificationEmail(): Observable<any> {
    if (!this.currentUserValue) {
      return of({ success: false, message: 'User not authenticated' });
    }
    
    return this.http.post<any>(`${this.apiUrl}/email/resend-verification`, {}, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.currentUserValue?.token}`
      })
    }).pipe(
      catchError(error => {
        console.error('Resend verification error:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to resend verification email. Please try again.'));
      })
    );
  }
} 