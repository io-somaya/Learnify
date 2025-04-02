// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
}

export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  package?: Package;
  payment?: any;
  message?: string;
  errors?: any;
}

export interface PaymentHistory {
  id: number;
  package: string;
  amount_paid: number;
  status: string;
  date: string;
  subscription_status: string;
  start_date: string;
  end_date: string;
  transaction_reference: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  // Initiate payment for a package
  initiatePayment(packageId: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/initiate`, { package_id: packageId });
  }

  // Get payment history for current user
  getPaymentHistory(): Observable<{ success: boolean; data: PaymentHistory[] }> {
    return this.http.get<{ success: boolean; data: PaymentHistory[] }>(`${this.apiUrl}/history`);
  }

  // Get payment details by ID
  getPayment(id: number): Observable<{ success: boolean; data: PaymentHistory }> {
    return this.http.get<{ success: boolean; data: PaymentHistory }>(`${this.apiUrl}/${id}`);
  }

  // Handle redirect after payment completion
  handlePaymentResult(params: any): void {
    console.log('Payment result:', params);
    // You can implement further handling logic here
    // For example, displaying success/error messages or redirecting to appropriate pages
  }
}
