import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import Pusher from 'pusher-js';
import { AuthService } from './auth.service';
import { NotificationModel } from '../core/models/notification.model';
import { tap, catchError } from 'rxjs/operators';

// Interface for creating a new notification
export interface CreateNotification {
  title: string;
  message: string;
  type: 'assignment' | 'lecture' | 'payment' | 'submission';
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private notificationsSubject = new BehaviorSubject<NotificationModel[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();
  private pusher: Pusher;
  private channel: any;

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Wait for auth to be initialized before setting up pusher
    if (this.authService.currentUserValue) {
      this.initializePusher();
    }
  }

  private initializePusher(): void {
    try {
      this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        forceTLS: true
      });

      // Subscribe to user-specific channel
      const userId = this.authService.currentUserValue?.id;
      if (userId) {
        console.log(`Subscribing to user.${userId}.notifications channel`);
        this.channel = this.pusher.subscribe(`user.${userId}.notifications`);
        this.setupUserChannelListeners();
      }

      // Listen for grade-specific notifications if user is a student
      const grade = this.authService.currentUserValue?.grade;
      if (grade) {
        console.log(`Subscribing to grade.${grade}.notifications channel`);
        const gradeChannel = this.pusher.subscribe(`grade.${grade}.notifications`);
        this.setupGradeChannelListeners(gradeChannel);
      }

      // Listen for teacher notifications if user is a teacher
      if (this.authService.isTeacher()) {
        console.log('Subscribing to teacher.notifications channel');
        const teacherChannel = this.pusher.subscribe('teacher.notifications');
        this.setupTeacherChannelListeners(teacherChannel);
      }
    } catch (error) {
      console.error('Error initializing Pusher:', error);
    }
  }

  private setupUserChannelListeners(): void {
    if (!this.channel) return;

    // Listen for assignment graded events
    this.channel.bind('assignment.graded', (data: any) => {
      console.log('New notification received:', data);
      this.handleNewNotification(data.notification);
    });

    // Add any other user-specific events here
    this.channel.bind('new.notification', (data: any) => {
      console.log('New generic notification received:', data);
      this.handleNewNotification(data.notification);
    });
  }

  private setupGradeChannelListeners(gradeChannel: any): void {
    gradeChannel.bind('new.assignment', (data: any) => {
      console.log('New assignment notification received:', data);
      this.handleNewNotification(data.notification);
    });

    gradeChannel.bind('new.lecture', (data: any) => {
      console.log('New lecture notification received:', data);
      this.handleNewNotification(data.notification);
    });
  }

  private setupTeacherChannelListeners(teacherChannel: any): void {
    teacherChannel.bind('new.payment', (data: any) => {
      console.log('New payment notification received:', data);
      this.handleNewNotification(data.notification);
    });

    teacherChannel.bind('new.submission', (data: any) => {
      console.log('New submission notification received:', data);
      this.handleNewNotification(data.notification);
    });
  }

  private handleNewNotification(notification: NotificationModel): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.updateUnreadCount([notification, ...currentNotifications]);
  }

  loadNotifications(): void {
    // Wait until auth is initialized
    if (!this.authService.currentUserValue) {
      console.log('Auth not initialized yet. Skipping notification load.');
      return;
    }

    const endpoint = this.authService.isTeacher()
      ? `${environment.apiUrl}/teacher/notifications`
      : `${environment.apiUrl}/student/notifications`;

    console.log('Loading notifications from:', endpoint);

    this.http.get<{ status: string, data: NotificationModel[] }>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Notifications loaded:', response.data);
          this.notificationsSubject.next(response.data);
          this.updateUnreadCount(response.data);
        },
        error: (err) => console.error('Error loading notifications:', err)
      });
  }

  markNotificationAsRead(notificationId: number): void {
    console.log('Marking notification as read:', notificationId);

    this.http.post(`${environment.apiUrl}/notifications/${notificationId}/read`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const updatedNotifications = this.notificationsSubject.value.map(n =>
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
          );
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount(updatedNotifications);
        },
        error: (err) => console.error('Error marking notification as read:', err)
      });
  }

  private updateUnreadCount(notifications: NotificationModel[]): void {
    const count = notifications.filter(n => !n.read_at).length;
    this.unreadCountSubject.next(count);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up Pusher subscription
    if (this.pusher) {
      try {
        // Unsubscribe from all channels
        const userId = this.authService.currentUserValue?.id;
        const grade = this.authService.currentUserValue?.grade;

        if (userId) {
          this.pusher.unsubscribe(`user.${userId}.notifications`);
        }

        if (grade) {
          this.pusher.unsubscribe(`grade.${grade}.notifications`);
        }

        if (this.authService.isTeacher()) {
          this.pusher.unsubscribe('teacher.notifications');
        }

        // Disconnect pusher
        this.pusher.disconnect();
      } catch (error) {
        console.error('Error disconnecting Pusher:', error);
      }
    }
  }


  createNotification(notification: CreateNotification): Observable<any> {
    console.log('Creating notification:', notification);

    return this.http.post(`${environment.apiUrl}/notifications`, notification)
      .pipe(
        tap((response: any) => {
          // Optionally handle the response
          console.log('Notification created:', response);

          // You could also immediately add this to your local notifications
          // if your API returns the created notification
          if (response && response.data) {
            this.handleNewNotification(response.data);
          }
        }),
        catchError(error => {
          console.error('Error creating notification:', error);
          return throwError(() => error);
        })
      );
  }

}
