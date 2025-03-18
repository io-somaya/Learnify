import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api'; 
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private tokenExpirationTimer: any;
  private isBrowser: boolean;
  public registerEmail: string ;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private getStoredUser(): any {
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token && this.isBrowser) {
            const user = {
              email: email,
              token: response.token,
              expiresIn: response.expires_in || 3600 // Default: 1 hour
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
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
        tap(response => {
          this.registerEmail = userData.email;
          return response;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
        })
      );
  }

  logout() {
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
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
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

  verifyEmail(userId: string, token: string, expires: string, signature: string): Observable<any> {
    const params = new HttpParams()
      .set('expires', expires)
      .set('signature', signature);

    return this.http.get(`${this.apiUrl}/email/verify/${userId}/${token}`, { params })
      .pipe(
        catchError(error => {
          console.error('Verify email error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to verify email. Please try again.'));
        })
      );
  }

  resendVerificationEmail(email?: string): Observable<any> {
    const emailToSend = email || this.currentUserValue?.email;

    if (!emailToSend) {
      return throwError(() => new Error('Email is required'));
    }

    return this.http.post<any>(`${this.apiUrl}/email/resend`, { email: emailToSend })
      .pipe(
        catchError(error => {
          console.error('Resend verification error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to resend verification email. Please try again.'));
        })
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.currentUserValue?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          if (response && response.token && this.isBrowser) {
            const user = {
              ...this.currentUserValue,
              token: response.token,
              expiresIn: response.expires_in || 3600
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            this.autoLogout(user.expiresIn * 1000);
          }
        }),
        catchError(error => {
          console.error('Refresh token error:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to refresh token. Please log in again.'));
        })
      );
  }
}