import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { INotification } from '../../Interfaces/INotification';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit {
  isOpen = false;
  
  constructor(
    public notificationService: NotificationService,
    private router: Router,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {
    // Setup real-time listeners when component initializes
    this.notificationService.setupRealTimeListeners();
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
}
