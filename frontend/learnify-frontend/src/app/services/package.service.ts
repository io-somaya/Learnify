import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../.environments/environment';
import { IPackage } from '../Interfaces/IPackage';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';
  // public packages: IPackage[] = [];

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const currentUser = localStorage.getItem('currentUser');
    const token = currentUser ? JSON.parse(currentUser).token : null;
    
    return token ? { 
      'Authorization': `Bearer ${token}` 
    } : {};
  }

  getPackages(): Observable<IPackage[]> {
    return this.http.get<{ data: IPackage[] }>(`${this.apiUrl}/packages`).pipe(
      tap((res) => {
        console.log('Fetched packages:', res.data);
      }),
      map((res) => res.data),
      catchError(this.handleError)
    );
  }
  
createPackage(packageData: Partial<IPackage>): Observable<IPackage> {
  return this.http.post<{ data: IPackage }>(
    `${this.apiUrl}/admin/packages`,
    packageData,
    { headers: this.getAuthHeaders() }
  ).pipe(
    tap((res) => {
      console.log('Created package:', res.data);
    }),
    map((res) => res.data),
    catchError(this.handleError)
  );
}

  updatePackage(id: number, packageData: Partial<IPackage>): Observable<IPackage> {
    return this.http.put<{ data: IPackage }>(
      `${this.apiUrl}/packages/${id}`, 
      packageData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((res) => {
        console.log('Updated package:', res.data);
      }),
      map((res) => res.data),
      catchError(this.handleError)
    );
  }

  deletePackage(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/packages/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((res) => {
        console.log('Delete response:', res);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}