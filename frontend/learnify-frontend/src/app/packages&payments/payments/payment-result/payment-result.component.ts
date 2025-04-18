import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { PaymentService } from '../../../services/payment.service';

@Component({
    selector: 'app-payment-result', 
    imports: [CommonModule], 
    standalone: true,
    templateUrl: './payment-result.component.html',
    styleUrls: ['./payment-result.component.scss']
})

export class PaymentResultComponent implements OnInit {
  status: string = 'unknown';
  message: string = '';
  transactionId: string = '';
  amount: string = '';
  packageId: string = '';
  timestamp: Date = new Date();
  paymentMethod: string = 'Credit Card';
  isProcessing: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Show loading state
    this.isProcessing = true;
    
    this.route.queryParams.subscribe(params => {
      console.log('Payment result params:', params);
      
      // Handle PayMob specific parameters
      this.status = this.getPaymentStatus(params);
      this.message = params['message'] || this.getDefaultMessage(this.status);
      this.transactionId = params['transaction_id'] || params['id'] || params['order'] || '';
      this.amount = params['amount'] || '';
      this.packageId = params['package_id'] || '';
      
      // Set payment method if provided by PayMob
      if (params['source_data_type']) {
        this.paymentMethod = this.formatPaymentMethod(params['source_data_type']);
      }
      
      // Initialize timestamp with current date
      this.timestamp = new Date();
      
      // Process payment result if needed
      this.processPaymentResult(params);
      
      // End loading state
      this.isProcessing = false;
    });
  }

  /**
   * Determine payment status from various parameter combinations
   */
  private getPaymentStatus(params: any): string {
    // Direct status parameter
    if (params['status']) {
      return params['status'].toLowerCase();
    }
    
    // PayMob success parameter
    if (params['success'] !== undefined) {
      return params['success'] === 'true' ? 'success' : 'error';
    }
    
    // Check for PayMob specific error codes
    if (params['txn_response_code']) {
      return params['txn_response_code'] === '0' ? 'success' : 'error';
    }
    
    // Default to error if we can't determine status
    return 'error';
  }

  /**
   * Get default message based on status
   */
  private getDefaultMessage(status: string): string {
    if (status === 'success') {
      return 'Your payment was processed successfully.';
    } else {
      return 'We could not process your payment at this time.';
    }
  }

  /**
   * Format payment method for display
   */
  private formatPaymentMethod(method: string): string {
    const methodMap: {[key: string]: string} = {
      'card': 'Credit/Debit Card',
      'wallet': 'Mobile Wallet',
      'cash': 'Cash on Delivery',
      'kiosk': 'Kiosk Payment'
    };
    
    return methodMap[method.toLowerCase()] || 'Online Payment';
  }

  /**
   * Process the payment result with backend if needed
   */
  private processPaymentResult(params: any): void {
    // If we have a successful payment, we might want to confirm with our backend
    if (this.status === 'success' && this.transactionId) {
      console.log('Processing successful payment:', this.transactionId);
      
      // You might want to call a service to verify the payment with your backend
      // this.paymentService.verifyPayment(this.transactionId).subscribe(...)
    }
  }

  /**
   * Navigate based on payment status
   */
  navigateToDashboard(): void {
    if (this.status === 'success') {
      // For successful payments, go to dashboard
      this.router.navigate(['/student/dashboard']);
      this.toastService.success('Payment successful! You now have access to your purchased content.');
    } else {
      // For failed payments, go back to packages
      this.router.navigate(['/student/dashboard/packages']);
      this.toastService.info('Returning to packages...');
    }
  }

  /**
   * Navigate to contact support
   */
  contactSupport(): void {
    this.router.navigate(['/contact']);
    this.toastService.info('Navigating to support...');
  }
}