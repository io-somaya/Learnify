import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../.environments/environment';
import { ILecture } from "../Interfaces/ILecture";
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LectureService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
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

  // GET single lecture by ID
  getLectureById(id: number): Observable<ILecture> {
    return this.http.get<{ data: ILecture }>(
      `${this.apiUrl}/admin/lectures/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Lecture Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  // POST create new lecture
  createLecture(lecture: ILecture): Observable<ILecture> {
    return this.http.post<{ data: ILecture }>(
      `${this.apiUrl}/admin/lectures`,
      lecture,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('CREATE Lecture Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  // PUT update existing lecture
  updateLecture(id: number, lecture: ILecture): Observable<ILecture> {
    return this.http.put<{ data: ILecture }>(
      `${this.apiUrl}/admin/lectures/${id}`,
      lecture,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('UPDATE Lecture Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
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