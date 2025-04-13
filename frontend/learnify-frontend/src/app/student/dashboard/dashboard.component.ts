import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { HeroComponent } from '../layout/hero/hero.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { OrderHistoryComponent } from '../order-history/order-history.component';
import { RouterOutlet } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { IUserProfile } from '../../Interfaces/IUserProfile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    SidebarComponent,
    FooterComponent,
    OrderHistoryComponent,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  showBackToTop = false;
  user: IUserProfile | null = null;
  isLoading = true;
  error = '';

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchProfile();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.pageYOffset > 300) {
      this.showBackToTop = true;
    } else {
      this.showBackToTop = false;
    }
  }

  fetchProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.user = response.data;
        } else {
          this.error = response.message || 'Unexpected response format';
        }
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
