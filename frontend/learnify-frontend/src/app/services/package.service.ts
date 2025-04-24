import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { IPackage } from '../Interfaces/IPackage';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
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

  getPackages(): Observable<IPackage[]> {
    return this.http.get<{ data: IPackage[] }>(
      `${this.apiUrl}/packages`,  // Changed to admin endpoint
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Packages Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  getPackageById(id: number): Observable<IPackage> {
    return this.http.get<{ data: IPackage }>(
      `${this.apiUrl}/admin/packages/${id}`,  // Changed to admin endpoint
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Package Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  createPackage(packageData: Partial<IPackage>): Observable<IPackage> {
    return this.http.post<{ data: IPackage }>(
      `${this.apiUrl}/admin/packages`,
      packageData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('CREATE Package Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  updatePackage(id: number, packageData: Partial<IPackage>): Observable<IPackage> {
    return this.http.put<{ data: IPackage }>(
      `${this.apiUrl}/admin/packages/${id}`,
      packageData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('UPDATE Package Response:', res)),
      map(res => res.data),
      catchError(this.handleError)
    );
  }

  deletePackage(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/admin/packages/${id}`,  // Changed to admin endpoint
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('DELETE Response:', res)),
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
