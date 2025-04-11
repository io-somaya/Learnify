import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';
  public userdata: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  private handleError(error: any) {
    console.error('Profile Service Error:', error);
    return throwError(() => ({
      message: error.error?.message || 'An error occurred',
      status: error.status,
      errors: error.error?.errors
    }));
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      map((response: any) => {
        // Handle the unusual response structure
        if (response.errors && typeof response.errors === 'object') {
          return {
            ...response,
            data: response.errors // Move errors to data property
          };
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updateProfile(profileData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  }): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/profile`, 
      profileData,
      { 
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/profile/password`, 
      data,
      { 
        headers: this.getAuthHeaders(),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updatePhoto(file: File): Observable<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post<{ photo_url: string }>(
      `${this.apiUrl}/profile/photo`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.authService.currentUserValue?.token}`
          // Don't set Content-Type - let browser set it with boundary
        }),
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }
}