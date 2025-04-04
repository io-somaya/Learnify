// edit-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  passwordForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = false;
  isPasswordUpdated = false;
  isPhotoUpdated = false;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private toaster: ToastService
  ) {
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadCurrentPhoto();
  }

  loadCurrentPhoto() {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.previewUrl = data.photo_url || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile photo', err);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.profileService.updatePassword(this.passwordForm.value).subscribe({
        next: () => {
          this.isPasswordUpdated = true;
          this.passwordForm.reset();
          setTimeout(() => this.isPasswordUpdated = false, 3000);
          this.isLoading = false;
          this.toaster.success('Password updated successfully');
        },
        error: (err) => {
          console.error('Failed to update password', err);
          this.isLoading = false;
          this.toaster.error('Failed to update password. Please try again.');
        }
      });
    }
  }

  updatePhoto() {
    if (this.selectedFile) {
      this.isLoading = true;
      this.profileService.updatePhoto(this.selectedFile).subscribe({
        next: (response) => {
          this.previewUrl = response.photo_url;
          this.selectedFile = null;
          this.isPhotoUpdated = true;
          setTimeout(() => this.isPhotoUpdated = false, 3000);
          this.isLoading = false;
          this.toaster.success('Photo updated successfully');
        },
        error: (err) => {
          console.error('Failed to update photo', err);
          this.isLoading = false;
          this.toaster.error('Failed to update photo. Please try again.');
        }
      });
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    return form.get('new_password')?.value === form.get('new_password_confirmation')?.value 
      ? null : { mismatch: true };
  }
}