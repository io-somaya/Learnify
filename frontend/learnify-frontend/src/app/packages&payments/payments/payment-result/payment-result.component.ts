import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-payment-result',
  imports: [CommonModule],
  standalone: true,

  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})

export class PaymentResultComponent implements OnInit {
  status: string = 'unknown';
  message: string = '';
  transactionId: string = '';
  amount: string = '';
  packageId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toster: ToastService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || 'unknown';
      this.message = params['message'] || '';
      this.transactionId = params['transaction_id'] || '';
      this.amount = params['amount'] || '';
      this.packageId = params['package_id'] || '';
    });
  }

  navigateToDashboard(): void {
    // Navigate to dashboard or another appropriate page
    this.router.navigate(['/student/dashboard']);
    this.toster.success('Payment successful! Redirecting to dashboard...');

  }
}
