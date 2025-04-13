import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IUserProfile } from "../../Interfaces/IUserProfile";
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../../.environments/environment';

interface ApiResponse {
  status: number;
  message: string;
  data: IUserProfile;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: IUserProfile | null = null;
  isLoading = true;
  error = '';
  profilePictureUrl = '';
  baseUrl = environment.apiUrl.replace('/api', '') ||'http://localhost:8000'; // Get base URL without /api
  
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: ApiResponse) => {
        if (response.status === 200) {
          this.user = response.data;
          // console.log(this.user);//DD
          if (this.user && this.user.profile_picture) {
            if (!this.user.profile_picture.startsWith('http')) {
              this.user.profile_picture = `${this.baseUrl}/storage/${this.user.profile_picture}`;
              this.profilePictureUrl = this.user.profile_picture;
            }
          }
        } else {
          this.error = response.message || 'Unexpected response format';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  // ... other methods remain the same


  editProfile(): void {
    this.router.navigate(['/admin/dashboard/profile/edit']);
  }

  changePassword(): void {
    this.router.navigate(['/admin/dashboard/profile/password']);
  }

  updatePhoto(): void {
    this.router.navigate(['/admin/dashboard/profile/photo']);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
} 