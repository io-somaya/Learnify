import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  searchQuery: string = '';
  
  @ViewChild('illustration') illustration!: ElementRef;
  
  constructor(private router: Router) {}
  
  navigateToHome(): void {
    window.history.back();
  }
  
  navigateToHelp(): void {
    this.router.navigate(['/help']);
  }
  
  search(): void {
    if (this.searchQuery.trim()) {
      // Implement your search functionality here
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery } 
      });
    }
  }
  
  onIllustrationMouseMove(event: MouseEvent): void {
    const element = this.illustration.nativeElement;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    // Apply the rotation
    element.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
  
  onIllustrationMouseLeave(): void {
    const element = this.illustration.nativeElement;
    element.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
  }
}