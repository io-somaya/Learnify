import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    standalone: false
})
export class PaymentComponent implements OnInit {
  packages: any[] = [];
  selectedPackageId: number | null = null;
  loading = false;
  error: string | null = null;
  paymentUrl: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.paymentService.handlePaymentResult(params);
      }
    });

    // Load packages - you'll need to implement this
    this.loadPackages();
  }

  loadPackages(): void {
    // Implement package loading from your API
    this.packages = [
      { id: 1, name: 'Monthly Subscription', price: 100, duration_days: 30, description: 'Basic monthly access' },
      { id: 2, name: 'Annual Subscription', price: 1000, duration_days: 365, description: 'Yearly access with discount' }
    ];
  }

  selectPackage(packageId: number): void {
    this.selectedPackageId = packageId;
  }

  initiatePayment(): void {
    if (!this.selectedPackageId) {
      this.error = 'Please select a package';
      return;
    }

    this.loading = true;
    this.error = null;

    this.paymentService.initiatePayment(this.selectedPackageId).subscribe({
      next: (response) => {
        if (response.success && response.payment_url) {
          window.location.href = response.payment_url;
        } else {
          this.error = response.message || 'Failed to initiate payment';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'An error occurred while initiating payment';
        this.loading = false;
      }
    });
  }
}
