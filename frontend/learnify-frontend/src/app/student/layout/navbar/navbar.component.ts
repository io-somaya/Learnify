import { Component, OnInit, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUserProfile } from '../../../Interfaces/IUserProfile';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationDropdownComponent } from '../../../components/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Input() user: IUserProfile | null = null;
  isScrolled = false;

  constructor(
    private AuthService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkScroll();
  }
  logout() {
    // Call the auth service logout method which handles the API call and local cleanup
    this.AuthService.logout();
    // Navigation is handled in the auth service's handleLogout method
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    this.isScrolled = window.scrollY > 60;
  }
}
