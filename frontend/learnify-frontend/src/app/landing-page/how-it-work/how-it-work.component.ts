import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-work',
  templateUrl: './how-it-work.component.html',
  styleUrls: ['./how-it-work.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HowItWorkComponent implements OnInit, AfterViewInit {
  steps = [
    {
      number: 'Step 1',
      title: 'Sign Up for an Account',
      description: 'Create your personal profile in minutes and gain access to our full range of educational tools and resources.'
    },
    {
      number: 'Step 2',
      title: 'Browse Available Courses',
      description: 'Explore our extensive library of courses designed by expert educators to match your learning goals.'
    },
    {
      number: 'Step 3',
      title: 'Enroll in Your Courses',
      description: 'Select the courses that interest you and fit your educational needs to start your learning journey.'
    },
    {
      number: 'Step 4',
      title: 'Learn at Your Own Pace',
      description: 'Access course materials anytime, anywhere, and progress through lessons at a speed that works for you.'
    },
    {
      number: 'Step 5',
      title: 'Track Your Progress',
      description: 'Monitor your achievements, view completed assignments, and see how close you are to reaching your goals.'
    }
  ];

  visibleItems: boolean[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize all items as not visible
    this.steps.forEach(() => this.visibleItems.push(false));
  }

  ngAfterViewInit(): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      // Set up intersection observer for animation on scroll
      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver();
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        this.makeAllItemsVisible();
      }
      
      // For demo purposes, make items visible with animation
      this.animateItemsSequentially();
    }, 100);
  }

  setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          this.visibleItems[index] = true;
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      item.setAttribute('data-index', index.toString());
      observer.observe(item);
    });
  }

  makeAllItemsVisible(): void {
    this.visibleItems = this.visibleItems.map(() => true);
  }

  animateItemsSequentially(): void {
    // Animate items sequentially for a nicer initial load effect
    this.steps.forEach((_, index) => {
      setTimeout(() => {
        this.visibleItems[index] = true;
      }, 300 * (index + 1));
    });
  }

  isVisible(index: number): boolean {
    return this.visibleItems[index];
  }
}
