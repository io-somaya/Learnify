import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  hasActiveSubscription = false;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    this.checkSubscription();
  }

  checkSubscription() {
    this.isLoading = true;
    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (subscription) => {
        // If we get here, we have an active subscription
        this.hasActiveSubscription = true;
        this.isLoading = false;
      },
      error: (error) => {
        // No active subscription or error
        this.hasActiveSubscription = false;
        this.isLoading = false;
        console.log('Subscription check error:', error);
        this.toastService.warning('No active subscription found');
        this.router.navigate(['student/dashboard/packages']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.toastService.success('Logged out successfully');
    this.router.navigate(['/']);
  }
}