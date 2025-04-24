import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IMaterial } from '../Interfaces/IMaterial';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private getToken(): string | null {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  getAllMaterials(): Observable<IMaterial[]> {
    return this.http.get<{ success: boolean, data: IMaterial[] }>(
      `${this.apiUrl}/admin/materials`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),  // This extracts the data property
      catchError(this.handleError)
    );
  }

  getMaterialById(id: number): Observable<IMaterial> {
    return this.http.get<{ success: boolean, data: IMaterial }>(
      `${this.apiUrl}/admin/materials/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  createMaterial(data: any): Observable<IMaterial> {
    return this.http.post<{ success: boolean, data: IMaterial }>(
      `${this.apiUrl}/admin/materials`,
      data,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  updateMaterial(id: number, data: any): Observable<IMaterial> {
    return this.http.put<{ success: boolean, data: IMaterial }>(
      `${this.apiUrl}/admin/materials/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  deleteMaterial(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/admin/materials/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'Unknown error';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error (${error.status}): ${error.error?.message || error.message}`;
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
