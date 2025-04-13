import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.css']
})
export class PhotoUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isUploading = false;
  error = '';
  successMessage = '';
  
  // Supported image formats
  acceptedFormats = 'image/jpeg, image/png, image/jpg';
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Validate file type
      if (!this.acceptedFormats.includes(file.type)) {
        this.error = 'Invalid file type. Please upload a JPEG or PNG image.';
        this.resetFileInput();
        return;
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.error = 'File is too large. Maximum size is 5MB.';
        this.resetFileInput();
        return;
      }
      
      this.selectedFile = file;
      this.error = '';
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  resetFileInput(): void {
    this.fileInput.nativeElement.value = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }

  uploadPhoto(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a file to upload.';
      return;
    }
  
    this.isUploading = true;
    this.error = '';
    this.successMessage = '';
  
    this.profileService.updatePhoto(this.selectedFile).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.successMessage = 'Profile photo updated successfully';
        
        if (this.profileService.userdata) {
          this.profileService.userdata.profile_picture = response.photo_url;
        }
        
        setTimeout(() => this.router.navigate(['/admin/dashboard/profile']), 2000);
      },
      error: (err) => {
        this.isUploading = false;
        this.error = err.message || 'Failed to upload photo';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard/profile']);
  }
} 