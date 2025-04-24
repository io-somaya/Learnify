// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../.environments/environment';
import { AuthService } from './auth.service';
import Pusher from 'pusher-js';
import { NotificationModel } from '../core/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationModel[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private pusher: any;
  private channel: any;
  private userChannel: any;
  private gradeChannel: any;
  private teacherChannel: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializePusher();
  }

  private initializePusher(): void {
    // Initialize Pusher with your credentials from environment
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      forceTLS: true
    });

    this.subscribeToChannels();

    // Load initial notifications when service starts
    this.loadNotifications();
  }

  private subscribeToChannels(): void {
    const user = this.authService.currentUserValue;

    if (!user) return;

    // Subscribe to personal notifications
    if (user.id) {
      this.userChannel = this.pusher.subscribe(`user.${user.id}.notifications`);
      this.userChannel.bind('assignment.graded', (data: any) => {
        this.handleNewNotification(data.notification);
      });
    }

    // Subscribe to grade-specific notifications for students
    if (user.role === 'student' && user.grade) {
      this.gradeChannel = this.pusher.subscribe(`grade.${user.grade}.notifications`);
      this.gradeChannel.bind('new.assignment', (data: any) => {
        this.handleNewNotification(data.notification);
      });
      this.gradeChannel.bind('new.lecture', (data: any) => {
        this.handleNewNotification(data.notification);
      });
    }

    // Subscribe to teacher notifications
    if (user.role === 'teacher' || user.role === 'assistant') {
      this.teacherChannel = this.pusher.subscribe('teacher.notifications');
      this.teacherChannel.bind('new.payment', (data: any) => {
        this.handleNewNotification(data.notification);
      });
    }
  }

  private handleNewNotification(notification: NotificationModel): void {
    const currentNotifications = this.notificationsSubject.getValue();
    const updatedNotifications = [notification, ...currentNotifications];

    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();

    // Optionally show a toast notification
    this.showToastNotification(notification);
  }

  private showToastNotification(notification: NotificationModel): void {
    // You can integrate this with your preferred toast library
    // Example with ngx-toastr:
    // this.toastr.info(notification.message, notification.title);

    // Or implement a custom toast system
    console.log('New notification:', notification.title);
  }

  loadNotifications(): void {
    const user = this.authService.currentUserValue;

    if (!user) return;

    let endpoint = '';

    if (user.role === 'student') {
      endpoint = `${environment.apiUrl}/notifications/student`;
    } else if (user.role === 'teacher' || user.role === 'assistant') {
      endpoint = `${environment.apiUrl}/notifications/teacher`;
    }

    this.http.get<{ status: string, data: NotificationModel[] }>(endpoint)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.notificationsSubject.next(response.data);
            this.updateUnreadCount();
          }
        },
        error: (error) => {
          console.error('Failed to load notifications', error);
        }
      });
  }

  markAsRead(notificationId: number): Observable<any> {
    const endpoint = `${environment.apiUrl}/notifications/${notificationId}/read`;

    return this.http.post(endpoint, {});
  }

  markNotificationAsRead(notificationId: number): void {
    this.markAsRead(notificationId).subscribe({
      next: () => {
        const notifications = this.notificationsSubject.getValue();
        const updatedNotifications = notifications.map(notification => {
          if (notification.id === notificationId) {
            return { ...notification, read_at: new Date().toISOString() };
          }
          return notification;
        });

        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();
      },
      error: (error) => {
        console.error('Failed to mark notification as read', error);
      }
    });
  }

  private updateUnreadCount(): void {
    const notifications = this.notificationsSubject.getValue();
    const unreadCount = notifications.filter(notification => !notification.read_at).length;
    this.unreadCountSubject.next(unreadCount);
  }

  disconnectChannels(): void {
    if (this.userChannel) {
      this.pusher.unsubscribe(this.userChannel.name);
    }
    if (this.gradeChannel) {
      this.pusher.unsubscribe(this.gradeChannel.name);
    }
    if (this.teacherChannel) {
      this.pusher.unsubscribe(this.teacherChannel.name);
    }
  }
}
