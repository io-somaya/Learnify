import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  constructor() { }

  scrollToElement(elementId: string): void {
    // First try with a small delay to ensure DOM is ready
    setTimeout(() => {
      this.performScroll(elementId);
    }, 100);
  }

  private performScroll(elementId: string): void {
    const element = document.getElementById(elementId);
    
    if (!element) {
      console.error(`Element with id '${elementId}' not found`);
      return;
    }

    // Get the navbar height to offset the scroll position
    const navbarHeight = document.querySelector('.navbar')?.clientHeight || 0;
    
    // Calculate the position to scroll to
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
    
    // Try multiple scroll methods for better compatibility
    try {
      // Method 1: Using window.scrollTo
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } catch (e) {
      // Method 2: Fallback to element.scrollIntoView
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e2) {
        // Method 3: Last resort - direct scroll
        window.scrollTo(0, offsetPosition);
      }
    }
  }
} 