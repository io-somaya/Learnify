import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map , switchMap, tap} from 'rxjs/operators';
import { environment } from '../../.environments/environment';
import { IAssignment, IAssignmentDetail, ISubmissionAnswer, ISubmissionPayload } from '../Interfaces/IAssignment';
import { ISubmissionResponse } from '../Interfaces/ISubmission';

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

  createAssignment(assignmentData: IAssignment): Observable<IAssignment> {
    return this.http.post<{ data: IAssignment }>(
      `${this.apiUrl}/admin/assignments`,
      assignmentData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('Create Assignment Response:', res)),
      map(res => res.data),
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

  getSubmissions(assignmentId: number, page: number = 1, perPage: number = 5, status?: string): Observable<ISubmissionResponse> {
    let url = `${this.apiUrl}/admin/assignments/${assignmentId}/submissions?page=${page}&per_page=${perPage}`;
    
    // Add status filter parameter if provided
    if (status) {
      url += `&status=${status}`;
    }
    
    return this.http.get<{
      status: number,
      message: string,
      data: ISubmissionResponse
    }>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      tap(res => console.log('Get Submissions Response:', res)),
      catchError(this.handleError)
    );
  }

  // Student methods  
  // Updated to return a single assignment with questions for student view
  getAssignmentsWithOutCorrectAnswer(assignmentId: number): Observable<IAssignment> {
    return this.http.get<{
      status: number,
      message: string,
      data: IAssignment
    }>(`${this.apiUrl}/student/assignments/${assignmentId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  submitAssignment(assignmentId: number, answers: ISubmissionAnswer[]): Observable<any> {
    if (!assignmentId) {
      return throwError(() => new Error('Assignment ID is required'));
    }

    if (!answers || answers.length === 0) {
      return throwError(() => new Error('Answers are required'));
    }

    console.log('Submitting assignment:', assignmentId, 'with answers:', answers);
    
    const payload: ISubmissionPayload = {
      answers: answers.map(answer => ({
        question_id: answer.question_id,
        option_id: answer.option_id
      }))
    };
    
    return this.http.post<any>(
      `${this.apiUrl}/student/assignments/${assignmentId}/submit`,
      payload,
      { 
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap(res => console.log('Submit Assignment Response:', res)),
      map(res => {
        if (res?.status === 500) {
          throw new Error(res.message || 'Server error occurred');
        }
        return res.data || res;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | Error) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred';
    
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client error: ${error.error.message}`;
      } else {
        // Handle structured error responses
        if (error.error && typeof error.error === 'object') {
          errorMessage = error.error.message || error.error.errors || `Server Error (${error.status})`;
        } else {
          errorMessage = `Server Error (${error.status}): ${error.error || error.message}`;
        }
        
        if (error.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        }
      }
    } else {
      // Handle regular Error objects
      errorMessage = error.message || 'Unknown error';
    }

    return throwError(() => new Error(errorMessage));
  }
}
