import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../../services/package.service';
import { IPackage } from '../../../Interfaces/IPackage';
import { CommonModule } from '@angular/common';

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

  constructor(private packageService: PackageService) {}

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

  // // Optional: Method to retry loading packages
  // retryLoadPackages(): void {
  //   this.isLoading = true;
  //   this.error = null;
  //   this.loadPackages();
  // }
}
