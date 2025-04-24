import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { IUserProfile , IPaginatedUsers} from '../Interfaces/IUserProfile';


@Injectable({
  providedIn: 'root'
})
export class StudentManagementService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private getToken(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  // GET all users with filtering and pagination
  getUsers(
    page: number = 1, 
    search?: string, 
    status?: string, 
    grade?: string, 
    perPage: number = 15
  ): Observable<{ data: IUserProfile[], total: number, currentPage: number, perPage: number, lastPage: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (grade) params.append('grade', grade);
  
    return this.http.get<{ 
      data: { 
        current_page: number,
        data: IUserProfile[],
        total: number,
        per_page: number ,
        last_page: number 
      } 
    }>(
      `${this.apiUrl}/admin/users?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Users Response:', res)),
      map(res => ({
        data: res.data.data,
        total: res.data.total,
        currentPage: res.data.current_page,
        perPage: res.data.per_page,
        lastPage: res.data.last_page
      })),
      catchError(this.handleError)
    );
  }

  // GET user by ID
  getUserById(id: number): Observable<IUserProfile> {
    return this.http.get<{ data: IUserProfile }>(
      `${this.apiUrl}/admin/users/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET User Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }


  
  // PUT update existing user
  updateUser(userId: number, userData: any): Observable<IUserProfile> {
    return this.http.put<{ data: IUserProfile }>(
      `${this.apiUrl}/admin/users/${userId}`,
      userData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  // DELETE user
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/admin/users/${userId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Change user status (active/inactive)
  changeUserStatus(userId: number, status: 'active' | 'inactive'): Observable<IUserProfile> {
    return this.http.patch<{ data: IUserProfile }>(
      `${this.apiUrl}/admin/users/${userId}/status`,
      { status },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }
// Change user role
  changeUserRole(userId: number, role: 'student' | 'assistant'): Observable<IUserProfile> {
    return this.http.patch<{ data: IUserProfile }>(
      `${this.apiUrl}/admin/users/${userId}/role`,
      { role },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }
  // Change user grade
  changeUserGrade(userId: number, grade: '1' | '2' | '3'): Observable<IUserProfile> {
    return this.http.patch<{ data: IUserProfile }>(
      `${this.apiUrl}/admin/users/${userId}/grade`,
      { grade },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }
  

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);

    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error (${error.status}): ${error.error?.message || error.message}`;
      if (error.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}