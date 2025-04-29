import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Declare AOS globally to avoid TypeScript errors
declare const AOS: any;

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule]
})
export class HeroComponent implements OnInit, AfterViewInit {
  constructor() { }
  
  ngOnInit() {
    // Initial setup
  }

  ngAfterViewInit() {
    // Initialize AOS animation library after the view is fully initialized
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          once: false,
          mirror: true,
          offset: 50
        });
        
        // Refresh AOS when all content is loaded
        window.addEventListener('load', () => {
          AOS.refresh();
        });
      }
    }, 100);
  }
}
