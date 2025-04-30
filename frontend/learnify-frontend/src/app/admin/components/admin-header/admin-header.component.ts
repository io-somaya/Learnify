import { Component, OnInit, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationDropdownComponent } from '../../../components/notification-dropdown/notification-dropdown.component';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationDropdownComponent, ClickOutsideDirective],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  user: IUserProfile | null = null;
  isBrowser: boolean;
  profileDropdown = false;
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Immediately fetch fresh profile data
      this.profileService.refreshProfile();
      this.loadUserProfile();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(): void {
    // Subscribe to the userProfile observable from ProfileService
    this.profileService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.user = profile;
        this.isLoading = false;
      });
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