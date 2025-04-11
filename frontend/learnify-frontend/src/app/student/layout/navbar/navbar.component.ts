import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isScrolled = false;

  constructor() { }

  ngOnInit(): void {
    // Initialize scroll state
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    // Check if page is scrolled
    this.isScrolled = window.scrollY > 60;
  }
}
