import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationDropdownComponent } from '../../../components/notification-dropdown/notification-dropdown.component';
import { AuthService } from '../../../services/auth.service';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { environment } from '../../../../.environments/environment';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationDropdownComponent, ClickOutsideDirective],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {
  user: IUserProfile | null = null;
  isBrowser: boolean;
  profileDropdown = false;
  baseUrl = environment.apiUrl.replace('/api', '') || 'http://localhost:8000';

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      this.user = JSON.parse(currentUser);
      
      // Format the profile picture URL if it exists
      this.formatProfilePicture();

      // If we only have basic user info, fetch the full profile
      if (!this.user.first_name) {
        this.authService.getUserData().subscribe({
          next: (userData) => {
            this.user = userData;
            this.formatProfilePicture();
          },
          error: (error) => {
            console.error('Error fetching user data:', error);
          }
        });
      }
    }
  }

  formatProfilePicture(): void {
    if (this.user && this.user.profile_picture) {
      // Check if the URL is already absolute
      if (!this.user.profile_picture.startsWith('http')) {
        this.user.profile_picture = `${this.baseUrl}/storage/${this.user.profile_picture}`;
      }
    }
  }

  getProfilePicture(): string {
    return this.user?.profile_picture || 'assets/images/default-avatar.png';
  }

  logout(): void {
    this.authService.logout();
  }

  closeProfileDropdown(): void {
    this.profileDropdown = false;
  }
}