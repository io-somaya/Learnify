import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../../services/package.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { IPackage } from '../../../Interfaces/IPackage';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

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
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.isLoading = true;
    this.error = null;
    
    this.packageService.getPackages().subscribe({
      next: (packages) => {
        // Make sure each package has the properties we need
        this.packages = packages.map(pkg => ({
          ...pkg,
          // Ensure duration_days has a default value if not provided
          duration_days: pkg.duration_days || 30
        }));
        this.isLoading = false;
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
    if (!this.authService.isAuthenticated()) {
      // Show a toast message to inform the user
      this.toastService.warning('Please log in to purchase a package');

      // Store the package ID in session storage for after login
      sessionStorage.setItem('pendingPackageId', packageId.toString());
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/packages` }
      });
      return;
    }

    this.paymentService.initiatePayment(packageId).subscribe({
      next: (response) => {
        if (response.success && response.payment_url) {
          window.location.href = response.payment_url;
          this.toastService.success('Payment initiated successfully. Please complete the payment.');
        } else {
          this.error = 'Payment initiation failed. Please try again.';
          this.toastService.error('Payment initiation failed. Please try again.');
        }
      },
      error: (err) => {
        console.error('Error during payment initiation:', err);
        this.error = err.message || 'An error occurred during payment initiation. Please try again.';
        if (err.status === 401) {
          this.router.navigate(['/login']);
          this.toastService.warning('Please log in to continue.');
        } else {
          this.error = 'An error occurred during payment initiation. Please try again.';
        }
      }
    });
  }

  // viewDetails(packageId: number): void {
  //   // Navigate to package details page
  //   this.router.navigate(['/packages', packageId]);
  // }
}