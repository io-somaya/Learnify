import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ILecture } from "../Interfaces/ILecture";
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LectureService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getToken(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }


  getLecturesStudent(): Observable<ILecture[]> {
    return this.http.get<{ data: ILecture[] }>(
      `${this.apiUrl}/student/lectures`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Lectures Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }
  // GET all lectures
  getLectures(): Observable<ILecture[]> {
    return this.http.get<{ data: ILecture[] }>(
      `${this.apiUrl}/admin/lectures`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Lectures Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  // GET lecture by ID
  getLectureById(id: number): Observable<ILecture> {
    return this.http.get<{ data: ILecture }>(
      `${this.apiUrl}/admin/lectures/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  // POST create new lecture
  createLecture(lecture: ILecture): Observable<ILecture> {
    return this.http.post<ILecture>(
      `${this.apiUrl}/admin/lectures`,
      lecture,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // PUT update lecture
  updateLecture(id: number, lecture: ILecture): Observable<ILecture> {
    return this.http.put<{ data: ILecture, status: number, message: string }>(
      `${this.apiUrl}/admin/lectures/${id}`,
      lecture,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        if (response.status !== 200) {
          throw new Error(response.message);
        }
      }),
      map(response => response.data),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.errors) {
          const messages = Object.values(error.error.errors).flat();
          return throwError(() => new Error(messages.join(', ')));
        }
        return throwError(() => error);
      })
    );
  }

  // DELETE lecture by ID
  deleteLecture(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/admin/lectures/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('DELETE Lecture Response:', res)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    const message =
      error.status === 401
        ? 'Session expired. Please login again.'
        : error.error?.message || 'Something went wrong';
    return throwError(() => new Error(message));
  }
}
