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

  getPackages(): Observable<IPackage[]> {
    return this.http.get<{ data: IPackage[] }>(`${this.apiUrl}/packages`).pipe(
      tap((res) => {
        console.log('Fetched packages:', res.data);
      }),
      map((res) => res.data),
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
