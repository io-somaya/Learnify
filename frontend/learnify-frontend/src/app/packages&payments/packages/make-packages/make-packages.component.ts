import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PackageService } from '../../../services/package.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-make-packages',
  standalone: true,
  imports: [ ReactiveFormsModule, RouterModule,CommonModule],
  templateUrl: './make-packages.component.html',
  styleUrl: './make-packages.component.css'
})
export class MakePackagesComponent implements OnInit {
  packageForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
    private router: Router,
    private toaster: ToastService
  ) {
    this.packageForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      duration_days: [30, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.packageForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    console.log('Package data:', this.packageForm.value);

    this.packageService.createPackage(this.packageForm.value).subscribe({
      next: (createdPackage) => {
        console.log('Package created:', createdPackage);
        this.isSubmitting = false;
        this.router.navigate(['/packages']); // Navigate to packages list
        this.toaster.success('Package created successfully!');
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create package';
        console.error('Error creating package:', error);
        this.toaster.error("Failed to create package");
        this.isSubmitting = false;
      }
    });
  }

  get name() { return this.packageForm.get('name'); }
  get description() { return this.packageForm.get('description'); }
  get price() { return this.packageForm.get('price'); }
  get duration_days() { return this.packageForm.get('duration_days'); }
}