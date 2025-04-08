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

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    const message =
      error.status === 401
        ? 'Session expired. Please login again.'
        : error.error?.message || 'Something went wrong';
    return throwError(() => new Error(message));
  }
}
