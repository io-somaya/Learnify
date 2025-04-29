import { Component, OnInit } from '@angular/core';
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
export class HeroComponent implements OnInit {
  constructor() { }
  
  ngOnInit() {
    // Initialize AOS animation library if it exists
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        once: false
      });
    }
  }
}
