import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminHeaderComponent } from '../admin/components/admin-header/admin-header.component';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, AdminHeaderComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  isMenuOpen = false;
  userRole: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    // Subscribe to userProfile changes
    this.profileService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userRole = profile.role || '';
      }
    });

    // Initial profile load if not already loaded
    if (this.authService.isAuthenticated() && !this.profileService.userdata) {
      this.profileService.refreshProfile();
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    // Call the auth service logout method which handles the API call and local cleanup
    this.authService.logout();
    // Navigation is handled in the auth service's handleLogout method
  }
  
  isAdmin(): boolean {
    return this.userRole === 'teacher';
  }
}