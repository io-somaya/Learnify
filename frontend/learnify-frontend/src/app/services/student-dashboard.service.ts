// src/app/services/student-dashboard.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { IStudentDashboard, IStudentDashboardResponse } from '../Interfaces/IStudentDashboard';

@Injectable({
  providedIn: 'root'
})
export class StudentDashboardService {
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

  getStudentDashboard(): Observable<IStudentDashboard> {
    return this.http.get<IStudentDashboardResponse>(
      `${this.apiUrl}/dashboard/student`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Student Dashboard Response:', res)),
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