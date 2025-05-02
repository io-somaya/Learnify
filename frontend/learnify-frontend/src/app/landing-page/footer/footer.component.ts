import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { icon: 'bi bi-facebook', url: '#' },
    { icon: 'bi bi-twitter', url: '#' },
    { icon: 'bi bi-instagram', url: '#' },
    { icon: 'bi bi-linkedin', url: '#' },
    { icon: 'bi bi-youtube', url: '#' }
  ];
}
