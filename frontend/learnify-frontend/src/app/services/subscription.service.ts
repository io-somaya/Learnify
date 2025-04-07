import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../.environments/environment';

export interface ISubscription {
  id: number;
  amount_paid: string;
  transaction_reference: string;
  payment_status: string;
  created_at: string;
  package_user: {
    user: {
      email: string;
      grade: string;
    };
    package: {
      name: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
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

  fetchSubscriptions(): Observable<ISubscription[]> {
    return this.http.get<{ data: ISubscription[] }>(
      `${this.apiUrl}/admin/subscription/`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(res => console.log('GET Subscriptions Response:', res)),
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
