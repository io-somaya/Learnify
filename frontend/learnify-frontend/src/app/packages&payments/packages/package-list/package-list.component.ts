import { Component, OnInit } from '@angular/core';
import { PackageService } from '../../../services/package.service';
import { IPackage } from '../../../Interfaces/IPackage';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule, FormsModule,TruncatePipe,RouterLink],
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.css']
})
export class PackageListComponent implements OnInit {
  packages: IPackage[] = [];
  filteredPackages: IPackage[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  isEmpty = false;

  constructor(
    private packageService: PackageService,
    private router: Router,
    private toaster: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.packageService.getPackages().subscribe({
      next: (packages) => {
        this.packages = packages;
        this.filteredPackages = [...packages];
        this.isEmpty = packages.length === 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load packages. Please try again later.';
        console.error('Error loading packages:', err);
      }
    });
  }

  onEdit(pkg: IPackage): void {
    this.router.navigate(['admin/dashboard/edit-package', pkg.id]);
  }

  onDelete(pkg: IPackage): void {
    if (confirm(`Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.packageService.deletePackage(pkg.id).subscribe({
        next: () => {
          this.successMessage = `Package "${pkg.name}" was deleted successfully`;
          setTimeout(() => this.successMessage = '', 3000);
          this.toaster.success(this.successMessage);
          this.loadPackages(); 


        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = `Failed to delete package "${pkg.name}". Please try again.`;
          console.error('Error deleting package:', err);
          this.toaster.error(`Failed to delete package "${pkg.name}". Please try again.`);
        }
      });
    }
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredPackages = [...this.packages];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredPackages = this.packages.filter(pkg => 
      pkg.name.toLowerCase().includes(term) || 
      pkg.description.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }
}