import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IUserProfile } from "../../Interfaces/IUserProfile";
import { ProfileService } from '../../services/profile.service';

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