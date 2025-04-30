import { Component, OnInit, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationDropdownComponent } from '../../../components/notification-dropdown/notification-dropdown.component';
import { ProfileService } from '../../../services/profile.service';
import { Subscription } from 'rxjs';
import { SubscriptionService } from '../../../services/subscription.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  hasActiveSubscription = false;

  user: IUserProfile | null = null;
  defaultImage = 'assets/images/default-avatar.png';
  private profileSubscription: Subscription | null = null;

  constructor(
    private AuthService: AuthService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
        private subscriptionService: SubscriptionService
    
  ) { }

  ngOnInit(): void {
    this.checkScroll();
    this.checkSubscription();

    
    this.profileSubscription = this.profileService.userProfile$.subscribe(user => {
      if (user) {
        this.user = { ...user };
        this.cdr.detectChanges(); 
      }
    });
  }
  checkSubscription() {
    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (subscription) => {
        // If we get here, we have an active subscription
        this.hasActiveSubscription = true;
      },
      error: (error) => {
        // No active subscription or error
        this.hasActiveSubscription = false;
        console.log('Subscription check error:', error);
      }
    });
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  getProfileImage(): string {
    if (!this.user?.profile_picture) return this.defaultImage;
    return this.profileService.formatProfilePictureUrl(this.user.profile_picture);
  }
  
  logout() {
    this.AuthService.logout();
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    this.isScrolled = window.scrollY > 60;
  }
}
