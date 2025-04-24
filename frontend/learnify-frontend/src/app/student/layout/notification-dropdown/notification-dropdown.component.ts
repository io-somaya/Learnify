// src/app/shared/components/notification-dropdown/notification-dropdown.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { NotificationModel } from '../../../core/models/notification.model';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: NotificationModel[] = [];
  unreadCount = 0;
  isOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to notifications
    const notificationsSub = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications.slice(0, 10); // Show only recent 10
      }
    );

    // Subscribe to unread count
    const unreadSub = this.notificationService.unreadCount$.subscribe(
      count => {
        this.unreadCount = count;
      }
    );

    this.subscriptions.push(notificationsSub, unreadSub);

    // Load notifications on init
    this.notificationService.loadNotifications();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  onNotificationClick(notification: NotificationModel): void {
    // Mark as read
    this.notificationService.markNotificationAsRead(notification.id);

    // Navigate to notification target if link exists
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }

    this.closeDropdown();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    // Check if today
    if (date.toDateString() === now.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  viewAllNotifications(): void {
    // You can navigate to a dedicated notifications page if needed
    // this.router.navigateByUrl('/notifications');
    this.closeDropdown();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
