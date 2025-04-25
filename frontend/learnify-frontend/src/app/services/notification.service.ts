import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { INotification } from '../Interfaces/INotification';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';
  private notificationsSubject = new BehaviorSubject<INotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadNotifications();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return new HttpHeaders({
      'Authorization': `Bearer ${currentUser.token}`,
      'Content-Type': 'application/json'
    });
  }

  private getCurrentUser() {
    if (!this.isBrowser) {
      return {};
    }
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  loadNotifications() {
    const user = this.getCurrentUser();
    if (!user.token) return;

    // Determine which endpoint to use based on user role
    let endpoint = '/notifications/student'; // default

    if (user.role === 'teacher' || user.role === 'assistant' || user.role === 'admin') {
      endpoint = '/notifications/teacher';
    }

    console.log('Loading notifications from endpoint:', endpoint);

    this.http.get<{status: string, data: INotification[]}>(`${this.apiUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          console.log('Loaded notifications:', response.data);
          this.notificationsSubject.next(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-read/${notificationId}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Update the local notification state
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(n => {
          if (n.id === notificationId) {
            return { ...n, read_at: new Date().toISOString() };
          }
          return n;
        });
        this.notificationsSubject.next(updatedNotifications);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-all-read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Update all notifications as read
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(n => {
          return { ...n, read_at: new Date().toISOString() };
        });
        this.notificationsSubject.next(updatedNotifications);
      })
    );
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read_at).length;
  }

  setupRealTimeListeners() {
    if (!this.isBrowser) return;

    const user = this.getCurrentUser();
    if (!user.token) return;

    // Import Echo from the global window object
    const Echo = (window as any).Echo;
    if (!Echo) {
      console.error('Laravel Echo is not initialized');
      return;
    }

    console.log('Setting up real-time notification listeners');

    // Listen to user-specific channel
    if (user.id) {
      Echo.channel(`user.${user.id}.notifications`)
        .listen('.subscription.expiring', (e: {notification: INotification}) => {
          console.log('Received subscription notification', e);
          this.addNotification(e.notification);
        })
        .listen('.assignment.graded', (e: {notification: INotification}) => {
          console.log('Received graded assignment notification', e);
          this.addNotification(e.notification);
        });
    }

    // Listen to grade-specific channel if student
    if (user.role === 'student' && user.grade) {
      Echo.channel(`grade.${user.grade}.notifications`)
        .listen('.new.assignment', (e: {notification: INotification}) => {
          console.log('Received new assignment notification', e);
          this.addNotification(e.notification);
        })
        .listen('.new.lecture', (e: {notification: INotification}) => {
          console.log('Received new lecture notification', e);
          this.addNotification(e.notification);
        });
    }

    // Listen to teacher channel if teacher/assistant/admin
    if (user.role === 'teacher' || user.role === 'assistant' || user.role === 'admin') {
      Echo.channel('teacher.notifications')
        .listen('.new.payment', (e: {notification: INotification}) => {
          console.log('Received payment notification', e);
          this.addNotification(e.notification);
        })
        .listen('.new.submission', (e: {notification: INotification}) => {
          console.log('Received submission notification', e);
          this.addNotification(e.notification);
        });
    }
  }

  private addNotification(notification: INotification) {
    const currentNotifications = this.notificationsSubject.value;
    // Check if notification already exists to avoid duplicates
    const exists = currentNotifications.some(n => n.id === notification.id);
    if (!exists) {
      this.notificationsSubject.next([notification, ...currentNotifications]);
    }
  }
}
