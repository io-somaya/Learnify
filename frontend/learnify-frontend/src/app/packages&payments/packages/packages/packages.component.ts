import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../../services/package.service';
import { PaymentService } from '../../../services/payment.service';
import { IPackage } from '../../../Interfaces/IPackage';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages.component.html',
  styleUrl: './packages.component.css'
})
export class PackagesComponent implements OnInit {
  packages: IPackage[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private packageService: PackageService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPackages();
    // Removed the incorrect line: this.purchasePackage(package.id)
  }

  private loadPackages(): void {
    this.packageService.getPackages().subscribe({
      next: (packages) => {
        this.packages = packages;
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching packages:', err);
        this.isLoading = false;
        this.error = err.message || 'Failed to load packages. Please try again later.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  purchasePackage(packageId: number): void {
    this.paymentService.initiatePayment(packageId).subscribe({
      next: (response) => {
        if (response.success && response.payment_url) {
          // Redirect to payment URL if available
          window.location.href = response.payment_url;
        } else if (response.success) {
          // Handle successful payment without redirect URL
          console.log('Payment initiated successfully:', response);
          // You might want to show a success message or navigate to a confirmation page
          // this.router.navigate(['/payment-success'], { queryParams: { paymentId: response.payment?.id } });
        } else {
          // Handle unsuccessful payment initiation
          console.error('Payment initiation failed:', response.message);
          this.error = response.message || 'Failed to initiate payment. Please try again.';
        }
      },
      error: (err) => {
        console.error('Error during payment initiation:', err);
        this.error = err.message || 'An error occurred during payment initiation. Please try again.';
      }
    });
  }

  viewDetails(packageId: number): void {
    // Navigate to package details page
    this.router.navigate(['/packages', packageId]);
  }
}