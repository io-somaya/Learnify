// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../.environments/environment';
import { IPaymentResponse } from '../Interfaces/IPaymentResponse';
import { IPaymentHistory } from '../Interfaces/IPaymentHistory';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return new HttpHeaders({
      'Authorization': `Bearer ${currentUser.token}`,
      'Content-Type': 'application/json'
    });
  }

  // Initiate payment for a package
  initiatePayment(packageId: number): Observable<IPaymentResponse> {
    const options = {
      headers: this.getAuthHeaders()
    };
    return this.http.post<IPaymentResponse>(`${this.apiUrl}/initiate`, { package_id: packageId }, options);
  }

  // Get payment history for current user
  getPaymentHistory(): Observable<{ success: boolean; data: IPaymentHistory[] }> {
    const options = {
      headers: this.getAuthHeaders()
    };
    return this.http.get<{ success: boolean; data: IPaymentHistory[] }>(`${this.apiUrl}/history`, options);
  }

  // // Get payment details by ID
  // getPayment(id: number): Observable<{ success: boolean; data: PaymentHistory }> {
  //   return this.http.get<{ success: boolean; data: PaymentHistory }>(`${this.apiUrl}/${id}`);
  // }

  // Handle redirect after payment completion
  // handlePaymentResult(params: any): void {
  // }
}
