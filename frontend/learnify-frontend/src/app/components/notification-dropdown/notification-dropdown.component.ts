import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { INotification } from '../../Interfaces/INotification';
import { EchoService } from '../../services/echo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  isOpen = false;
  private notificationSubscription?: Subscription;
  private refreshInterval?: any;
  isRefreshing = false;

  constructor(
    public notificationService: NotificationService,
    private echoService: EchoService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  notifications: INotification[] = [];

  ngOnInit() {
    // Subscribe to notifications with improved handling
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notifications => {
      console.log('Notification dropdown received updated notifications:', notifications.length);
      this.notifications = [...notifications]; // Create a new array reference to trigger change detection

      // Force UI update if needed
      setTimeout(() => {
        if (this.isOpen) {
          // If dropdown is open, make sure it reflects the latest notifications
          this.isOpen = false;
          setTimeout(() => this.isOpen = true, 10);
        }
      }, 100);
    });

    // Subscribe to Echo connection status with improved error handling
    this.echoService.connectionStatus$.subscribe({
      next: (status) => {
        console.log('Notification dropdown received connection status:', status);

        // If connection is established, make sure listeners are set up
        if (status === 'connected') {
          console.log('Connection established, setting up real-time listeners');
          this.notificationService.setupRealTimeListeners();
        } else if (status === 'disconnected' || status === 'error') {
          console.log('Connection lost or error, will rely on polling');
        }
      },
      error: (err) => {
        console.error('Error in connection status subscription:', err);
      }
    });

    // Make sure Echo is initialized before setting up listeners
    if (!this.echoService.isEchoInitialized) {
      console.log('Echo not initialized, initializing from notification dropdown');
      this.echoService.initializeEcho().then(() => {
        console.log('Echo initialized from notification dropdown');
        // Explicitly set up listeners after initialization
        this.notificationService.setupRealTimeListeners();
      }).catch(error => {
        console.error('Failed to initialize Echo from notification dropdown:', error);
      });
    } else {
      console.log('Echo already initialized, setting up listeners');
      this.notificationService.setupRealTimeListeners();
    }

    // Request notification permission if not already granted
    this.requestNotificationPermission();

    // Set up periodic refresh (includes immediate first refresh)
    // This will load notifications immediately and then every 30 seconds
    this.startRefreshInterval();
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = undefined;
    }

    // Clear the refresh interval
    this.stopRefreshInterval();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  markAsRead(notification: INotification, event: Event) {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }

  navigateTo(notification: INotification) {
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
      this.closeDropdown();

      // Mark as read when clicked
      if (!notification.read_at) {
        this.notificationService.markAsRead(notification.id).subscribe();
      }
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hr ago`;
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }

  getNotificationIcon(type: string): string {
    switch(type) {
      case 'assignment': return 'fa-book-open';
      case 'lecture': return 'fa-chalkboard-teacher';
      case 'payment': return 'fa-credit-card';
      case 'submission': return 'fa-paper-plane';
      case 'subscription': return 'fa-calendar-check';
      default: return 'fa-bell';
    }
  }

  // Track notifications by ID for better performance
  trackByNotificationId(index: number, notification: INotification): number {
    return notification.id;
  }

  // Start the refresh interval
  private startRefreshInterval(): void {
    // Clear any existing interval first
    this.stopRefreshInterval();

    // Perform an immediate refresh first
    const now = new Date();
    console.log(`[${now.toLocaleTimeString()}] Performing immediate refresh before starting interval`);
    this.performRefresh(false); // Silent refresh

    // Set up a new interval - exactly every 30 seconds
    this.refreshInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] Periodic notification refresh (30s interval)`);
      this.performRefresh(false); // Silent refresh
    }, 30000);

    console.log('Notification refresh interval started');
  }

  // Stop the refresh interval
  private stopRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
      console.log('Notification refresh interval stopped');
    }
  }

  // Perform the actual refresh operation
  private performRefresh(showIndicator: boolean = true): void {
    if (this.isRefreshing) return; // Prevent multiple simultaneous refreshes

    if (showIndicator) {
      this.isRefreshing = true;
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] Refreshing notifications...`);

    this.notificationService.loadNotifications().subscribe({
      next: (notifications) => {
        const completeTime = new Date().toLocaleTimeString();
        console.log(`[${completeTime}] Notifications refreshed successfully (${notifications.length} notifications)`);
        if (showIndicator) {
          // Reset the refreshing state after a short delay to show the animation
          setTimeout(() => {
            this.isRefreshing = false;
          }, 500);
        } else {
          this.isRefreshing = false;
        }
      },
      error: (error) => {
        console.error(`[${new Date().toLocaleTimeString()}] Error refreshing notifications:`, error);
        this.isRefreshing = false;
      }
    });
  }

  // Force refresh notifications (manual trigger from button)
  refreshNotifications(): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] Manually refreshing notifications (button click)`);
    this.performRefresh(true);

    // Reset the interval timer after manual refresh
    this.startRefreshInterval();
  }
}