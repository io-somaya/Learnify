import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IUserProfile } from '../../Interfaces/IUserProfile';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../../.environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class StudentProfileComponent implements OnInit {
  user: IUserProfile | null = null;
  isLoading = true;
  error: string | null = null;
  baseUrl = environment.backendUrl || environment.apiUrl.replace('/api', '');

  constructor(
    public router: Router,
    private profileService: ProfileService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.isLoading = true;
    this.error = null;
    
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        // Extract user data from the response structure
        if (response.data) {
          this.user = response.data;
        } else if (response) {
          // Fallback if response structure is different
          this.user = response;
        }
        
        // Format the profile picture URL if it exists
        if (this.user && this.user.profile_picture) {
          // If the profile picture doesn't start with http, assume it's a relative path
          if (!this.user.profile_picture.startsWith('http')) {
            this.user.profile_picture = `${this.baseUrl}/storage/${this.user.profile_picture}`;
          }
        } else if (this.user) {
          // Set default profile picture if none exists
          this.user.profile_picture = 'assets/images/default-avatar.png';
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.isLoading = false;
        this.error = err.message || 'Failed to load profile';
        this.toastService.error('Failed to load profile data. Please try again.');
      }
    });
  }

  editProfile(): void {
    this.router.navigate(['/student/dashboard/profile/edit']);
  }

  changePassword(): void {
    this.router.navigate(['/student/dashboard/profile/password']);
  }

  editPhoto(): void {
    this.router.navigate(['/student/dashboard/profile/photo']);
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
} 