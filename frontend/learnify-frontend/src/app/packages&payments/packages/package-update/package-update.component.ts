import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PackageService } from '../../../services/package.service';
import { IPackage } from '../../../Interfaces/IPackage';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-package-update',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './package-update.component.html',
  styleUrls: ['./package-update.component.css']
})
export class PackageUpdateComponent implements OnInit {
  updateForm: FormGroup;
  packageId: number;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentPackage: IPackage | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    private toaster: ToastService
  ) {
    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0)]],
      duration_days: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.packageId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPackageData();
  }
  loadPackageData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Use getPackage instead of getPackages
    this.packageService.getPackageById(this.packageId).subscribe({
      next: (pkg) => {
        this.currentPackage = pkg;
        this.updateForm.patchValue({
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          duration_days: pkg.duration_days
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load package data. Please try again.';
        console.error('Error details:', err);
      }
    });
  }

onSubmit(): void {
  if (this.updateForm.invalid) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Only send the fields that are in the form
  const packageData = {
    name: this.updateForm.value.name,
    description: this.updateForm.value.description,
    price: this.updateForm.value.price,
    duration_days: this.updateForm.value.duration_days
  };

  this.packageService.updatePackage(this.packageId, packageData).subscribe({
    next: (updatedPackage) => {
      this.isLoading = false;
      this.successMessage = 'Package updated successfully!';
      console.log('Update successful:', updatedPackage);
      setTimeout(() => {
        this.router.navigate(['/admin/dashboard/packages-list']);
      }, 1500);
      this.toaster.success('Package updated successfully!');},
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = `Failed to update package: ${err.error?.message || err.message}`;
      console.error('Full error:', err);
      this.toaster.error(`Failed to update package: ${err.error?.message || err.message}`);
    }
  });
}
  get name() { return this.updateForm.get('name'); }
  get description() { return this.updateForm.get('description'); }
  get price() { return this.updateForm.get('price'); }
  get duration_days() { return this.updateForm.get('duration_days'); }
}