import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { IAssignment, IAssignmentDetail } from '../Interfaces/IAssignment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const currentUser = localStorage.getItem('currentUser');
    const token = currentUser ? JSON.parse(currentUser).token : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  getAssignments(): Observable<IAssignment[]> {
    return this.http.get<{
      status: number,
      message: string,
      data: IAssignment[]
    }>(`${this.apiUrl}/admin/assignments`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  getAssignmentById(id: number, page: number = 1): Observable<IAssignmentDetail> {
    return this.http.get<{
      status: number,
      message: string,
      data: IAssignmentDetail
    }>(`${this.apiUrl}/admin/assignments/${id}?page=${page}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  createAssignment(assignmentData: Partial<IAssignment>): Observable<IAssignment> {
    return this.http.post<{
      status: number,
      message: string,
      data: IAssignment
    }>(`${this.apiUrl}/admin/assignments`, assignmentData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  updateAssignment(id: number, assignmentData: Partial<IAssignment>): Observable<IAssignment> {
    return this.http.put<{
      status: number,
      message: string,
      data: IAssignment
    }>(`${this.apiUrl}/admin/assignments/${id}`, assignmentData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  deleteAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/assignments/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
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
