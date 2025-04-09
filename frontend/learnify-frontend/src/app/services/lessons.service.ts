import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { ILesson, IPaginatedLessons } from '../Interfaces/ILesson';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
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

  getLessons(page: number = 1, grade?: string, search?: string, perPage: number = 10): Observable<{ data: ILesson[], total: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (grade) params.append('grade', grade);
    if (search) params.append('search', search);
    params.append('per_page', perPage.toString());
  
    return this.http.get<{ 
      data: { 
        current_page: number,
        data: ILesson[],
        total: number,
        per_page: number,
        last_page: number 
      } 
    }>(
      `${this.apiUrl}/lessons?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Lessons Response:', res)),
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

  getLessonById(id: number): Observable<ILesson> {
    return this.http.get<{ data: ILesson }>(
      `${this.apiUrl}/lessons/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Lesson Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  getManagedLessons(
    page: number = 1,
    grade?: string,
    search?: string,
    perPage: number = 10
  ): Observable<{ status: string, data: IPaginatedLessons, message: string }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (grade) params.append('grade', grade);
    if (search) params.append('search', search);
    params.append('per_page', perPage.toString());
  
    return this.http.get<{ 
      status: string, 
      data: IPaginatedLessons, 
      message: string 
    }>(
      `${this.apiUrl}/lessons?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('API Response:', res)),
      catchError(this.handleError)
    );
  }

  // Add to LessonService
deleteLesson(lessonId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/lessons/${lessonId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }
  
  // If you need create/update methods:
  createLesson(lessonData: any): Observable<ILesson> {
    return this.http.post<{ data: ILesson }>(
      `${this.apiUrl}/lessons`,
      lessonData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }
  
  updateLesson(lessonId: number, lessonData: any): Observable<ILesson> {
    return this.http.put<{ data: ILesson }>(
      `${this.apiUrl}/lessons/${lessonId}`,
      lessonData,
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
