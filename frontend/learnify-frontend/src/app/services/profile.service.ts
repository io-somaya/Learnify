import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { AuthService } from './auth.service';
import { IUserProfile } from '../Interfaces/IUserProfile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';
  private baseUrl = environment.apiUrl ? environment.apiUrl.replace('/api', '') : 'http://localhost:8000';
  public userdata: any;

  // Initialize with null; it will be populated when getProfile is called
  private userProfileSubject = new BehaviorSubject<IUserProfile | null>(null);
  public userProfile$: Observable<IUserProfile | null> = this.userProfileSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize profile data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.refreshProfile();
    }
  }
  
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

  // Helper method to format profile picture URLs
  formatProfilePictureUrl(path: string | null): string {
    if (!path) return 'assets/images/default-avatar.png';
    
    // If the path already starts with http, it's already a full URL
    if (path.startsWith('http')) return path;
    
    // Otherwise, append the path to the storage URL
    return `${this.baseUrl}/storage/${path}`;
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
        
        // Format the profile picture URL if there's data
        if (response.data && response.data.profile_picture) {
          response.data.profile_picture = this.formatProfilePictureUrl(response.data.profile_picture);
        }
        
        // Store user data for reuse and update the subject
        this.userdata = response.data;
        this.userProfileSubject.next(response.data);

        return response;
      }),
      catchError(this.handleError)
    );
  }

  refreshProfile(): void {
    this.getProfile().subscribe({
      next: (response) => {
        if (response.data) {
          this.userdata = {
            ...response.data,
            profile_picture: this.formatProfilePictureUrl(response.data.profile_picture)
          };
          
          this.userProfileSubject.next(this.userdata);
        }
      },
      error: (err) => {
        console.error('Failed to refresh profile:', err);
        // Don't set to null here to avoid losing data on errors
      }
    });
  }
  
  getProfilePicture(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/photo`, { 
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      map((response: any) => {
        // Format the URL if it exists in the response
        if (response && response.data && response.data.photo_url) {
          response.data.photo_url = this.formatProfilePictureUrl(response.data.photo_url);
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
      tap(response => {
        // After successful update, refresh the profile data
        this.refreshProfile();
        return response;
      }),
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
        }),
        withCredentials: true
      }
    ).pipe(
      map(response => {
        if (response && response.photo_url) {
          const formattedUrl = this.formatProfilePictureUrl(response.photo_url);
          
          // After successful photo upload, update the user profile data 
          // with the new photo URL and notify all subscribers
          if (this.userdata) {
            this.userdata = {
              ...this.userdata,
              profile_picture: formattedUrl
            };
            
            // Update the subject with the new data
            this.userProfileSubject.next(this.userdata);
          } else {
            // If somehow we don't have user data yet, refresh the whole profile
            this.refreshProfile();
          }
          
          response.photo_url = formattedUrl;
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }
}