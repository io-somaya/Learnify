import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { FeaturesComponent } from './features/features.component';
import { HowItWorkComponent } from './how-it-work/how-it-work.component';
import { StatsComponent } from './stats/stats.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { PricingComponent } from './pricing/pricing.component';
import { FooterComponent } from './footer/footer.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    HowItWorkComponent,
    StatsComponent,
    TestimonialsComponent,
    PricingComponent,
    FooterComponent,
    LeaderboardComponent
  ]
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  constructor() { }

  ngOnInit(): void {
    // Add event listener for hash changes
    window.addEventListener('hashchange', this.handleHashChange);
  }

  ngAfterViewInit(): void {
    // Check if there's a hash in the URL on page load
    this.handleHashChange();
  }

  private handleHashChange = () => {
    const hash = window.location.hash;
    if (hash === '#leaderboard-section') {
      setTimeout(() => {
        const element = document.getElementById('leaderboard-section');
        if (element) {
          const navbarHeight = document.querySelector('.navbar')?.clientHeight || 0;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }
}
