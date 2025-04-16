import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize any data or services here
  }

  ngAfterViewInit(): void {
    // Start animations after view is initialized and only if we're in a browser
    if (isPlatformBrowser(this.platformId)) {
      this.animateCounters();
    }
  }

  /**
   * Navigate to the students page
   */
  viewAllStudents(): void {
    this.router.navigate(['/admin/students']);
  }

  /**
   * Navigate to the lessons management page
   */
  manageLessons(): void {
    this.router.navigate(['/admin/dashboard/lessons-management']);
  }

  /**
   * Navigate to the subscriptions page
   */
  viewSubscriptionDetails(): void {
    this.router.navigate(['/admin/dashboard/subscriptions-list']);
  }

  /**
   * Animates the counter elements to count up to their target values
   */
  private animateCounters(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the faster
    
    counters.forEach(counter => {
      const htmlElement = counter as HTMLElement;
      const target = +(htmlElement.getAttribute('data-target') || '0');
      const count = 0;
      
      const inc = Math.ceil(target / speed);
      
      // Use a self-executing function to handle each counter independently
      const updateCount = () => {
        const currentCount = +htmlElement.innerText;
        
        // If the current count is less than the target, continue incrementing
        if (currentCount < target) {
          htmlElement.innerText = (currentCount + inc).toString();
          // Call updateCount again after a short delay
          setTimeout(updateCount, 25);
        } else {
          // Ensure we end exactly at the target value
          htmlElement.innerText = target.toString();
        }
      };
      
      // Start the counter animation
      updateCount();
    });
  }
}
