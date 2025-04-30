import { Component, OnInit, HostListener, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { HeroComponent } from '../layout/hero/hero.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { DashboardHomeComponent } from '../dashboard-home/dashboard-home.component';
import { RouterOutlet } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { IUserProfile } from '../../Interfaces/IUserProfile';
import { environment } from '../../../.environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    SidebarComponent,
    FooterComponent,
    DashboardHomeComponent,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  showBackToTop = false;
  user: IUserProfile | null = null;
  isLoading = true;
  error = '';
  baseUrl = environment.apiUrl.replace('/api', '') || 'http://localhost:8000';

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.profileService.userProfile$.subscribe({
      next: (updatedProfile) => {
        if (updatedProfile) {
          this.user = { ...updatedProfile };
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error in profile subscription:', error);
        this.error = 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.refreshProfile();
  }

  refreshProfile(): void {
    this.profileService.refreshProfile();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
