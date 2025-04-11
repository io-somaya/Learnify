import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  isMenuOpen = false;
  constructor(
    private authService: AuthService,
  ) {}
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    // Implement your logout logic here
    console.log('Logout clicked');
    // Example: this.authService.logout();
    // this.authService.logout().subscribe({
      // next: (response: unknown) => {
        // console.log('Logout successful', response);
        // Redirect to login or perform any other action
      // },
      // error: (error: Error) => {
        // console.error('Logout failed', error);
      // }
    // });
  // }
}
}