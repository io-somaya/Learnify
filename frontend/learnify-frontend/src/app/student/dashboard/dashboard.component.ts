import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { HeroComponent } from '../layout/hero/hero.component';
import { OrderHistoryComponent } from '../order-history/order-history.component';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    HeroComponent,
    OrderHistoryComponent,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupBackToTop();
    }
  }

  private setupBackToTop(): void {
    const backToTop = document.querySelector('.back-to-top') as HTMLElement;
    
    if (backToTop) {
      // Initial state - hide the button
      backToTop.style.display = 'none';
      
      // Add click event
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
      
      // Show/hide based on scroll position
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          backToTop.style.display = 'flex';
        } else {
          backToTop.style.display = 'none';
        }
      });
    }
  }
}
