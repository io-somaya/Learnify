import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { INotification } from '../../Interfaces/INotification';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-notifications.component.html',
  styleUrls: ['./admin-notifications.component.scss']
})
export class AdminNotificationsComponent implements OnInit {
  notifications: INotification[] = [];
  filteredNotifications: INotification[] = [];
  loading = true;
  selectedFilter: 'all' | 'unread' | 'read' = 'all';
  selectedType: string = 'all';
  searchTerm: string = '';
  isBrowser: boolean;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadNotifications();

      // Subscribe to real-time notifications
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilters();
      });
    }
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.loadNotifications();
    this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.toastService.error('Failed to load notifications');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    // Apply read/unread filter
    if (this.selectedFilter === 'read') {
      filtered = filtered.filter(n => n.read_at !== null);
    } else if (this.selectedFilter === 'unread') {
      filtered = filtered.filter(n => n.read_at === null);
    }

    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === this.selectedType);
    }

    // Apply search
    if (this.searchTerm.trim() !== '') {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    this.filteredNotifications = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  get paginatedNotifications(): INotification[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNotifications.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  markAsRead(notification: INotification): void {
    if (notification.read_at) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.toastService.success('Notification marked as read');
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
        this.toastService.error('Failed to mark notification as read');
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('All notifications marked as read');
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.toastService.error('Failed to mark all notifications as read');
      }
    });
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
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    // If older than a month, return the date
    return date.toLocaleDateString();
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

  getNotificationTypeLabel(type: string): string {
    switch(type) {
      case 'assignment': return 'Assignment';
      case 'lecture': return 'Lecture';
      case 'payment': return 'Payment';
      case 'submission': return 'Submission';
      case 'subscription': return 'Subscription';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }

  // Helper method to check if there are any unread notifications
  hasUnreadNotifications(): boolean {
    return this.filteredNotifications.some(n => !n.read_at);
  }
}
