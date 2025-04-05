import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../../services/package.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
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
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
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
    if (!this.authService.isAuthenticated()) {
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
        } else {
          this.error = 'Payment initiation failed. Please try again.';
        }
      },
      error: (err) => {
        console.error('Error during payment initiation:', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'An error occurred during payment initiation. Please try again.';
        }
      }
    });
  }

  viewDetails(packageId: number): void {
    // Navigate to package details page
    this.router.navigate(['/packages', packageId]);
  }
}