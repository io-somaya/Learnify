import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router
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
    this.router.navigate(['/dashboard']);
  }
}