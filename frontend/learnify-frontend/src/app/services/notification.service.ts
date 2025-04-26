import { Injectable, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { INotification } from '../Interfaces/INotification';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { EchoService } from './echo.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';
  private notificationsSubject = new BehaviorSubject<INotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private isBrowser: boolean;
  private currentUser: any = {};

  // Polling fallback
  private pollingSubscription: Subscription | null = null;
  private pollingInterval = 30000; // 30 seconds
  private usePollingFallback = true; // Enable polling as fallback

  // Connection status
  private connectionStatusSubscription: Subscription | null = null;
  private isConnected = false;

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private echoService: EchoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // Subscribe to Echo connection status
      this.connectionStatusSubscription = this.echoService.connectionStatus$.subscribe(status => {
        console.log('WebSocket connection status:', status);
        this.isConnected = status === 'connected';

        // If disconnected and polling is enabled, start polling
        if (!this.isConnected && this.usePollingFallback) {
          this.startPolling();
        } else if (this.isConnected && this.pollingSubscription) {
          // If connected and polling is active, stop polling
          this.stopPolling();
        }
      });

      // Initial load of notifications
      this.loadNotifications();

      // Initialize Echo
      this.checkAndInitializeEcho();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${this.currentUser.token}`,
      'Content-Type': 'application/json'
    });
  }

  private checkAndInitializeEcho(): void {
    if (this.currentUser.token) {
      this.echoService.initializeEcho().then(() => {
        console.log('Echo initialized successfully, setting up listeners');
        this.setupRealTimeListeners();
      }).catch(error => {
        console.error('Failed to initialize Echo:', error);
        // Try again after a delay
        setTimeout(() => this.checkAndInitializeEcho(), 5000);
      });
    }
  }

  loadNotifications(): void {
    if (!this.currentUser.token) return;

    let endpoint = '/notifications/student';
    if (['teacher', 'assistant', 'admin'].includes(this.currentUser.role)) {
      endpoint = '/notifications/teacher';
    }

    this.http.get<{ status: string, data: INotification[] }>(`${this.apiUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.notificationsSubject.next(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
      }
    });
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-read/${notificationId}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.map(n => {
          return n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n;
        });
        this.notificationsSubject.next(updated);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/mark-all-read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.map(n => ({
          ...n,
          read_at: new Date().toISOString()
        }));
        this.notificationsSubject.next(updated);
      })
    );
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read_at).length;
  }

  setupRealTimeListeners(): void {
    if (!this.isBrowser || !this.currentUser.token) return;

    const Echo = this.echoService.echo;
    if (!Echo) {
      console.error('Laravel Echo is not initialized');
      // Try again after a delay
      setTimeout(() => this.setupRealTimeListeners(), 2000);
      return;
    }

    console.log('Setting up real-time notification listeners...');

    // Disconnect any existing connections to avoid duplicates
    Echo.disconnect();

    // User-specific notifications
    if (this.currentUser.id) {
      const privateChannel = Echo.private(`user.${this.currentUser.id}.notifications`);

      privateChannel
        .listen('.subscription.expiring', (e: { notification: INotification }) => {
          console.log('Received subscription.expiring notification:', e);
          this.zone.run(() => this.addNotification(e.notification));
        })
        .listen('.assignment.graded', (e: { notification: INotification }) => {
          console.log('Received assignment.graded notification:', e);
          this.zone.run(() => this.addNotification(e.notification));
        });

      console.log(`Subscribed to private user.${this.currentUser.id}.notifications`);
    }

    // Grade-specific (students)
    if (this.currentUser.role === 'student' && this.currentUser.grade) {
      const gradeChannel = Echo.channel(`grade.${this.currentUser.grade}.notifications`);

      gradeChannel
        .listen('.new.assignment', (e: { notification: INotification }) => {
          console.log('Received new.assignment notification:', e);
          this.zone.run(() => this.addNotification(e.notification));
        })
        .listen('.new.lecture', (e: { notification: INotification }) => {
          console.log('Received new.lecture notification:', e);
          this.zone.run(() => this.addNotification(e.notification));
        });

      console.log(`Subscribed to grade.${this.currentUser.grade}.notifications`);
    }

    // Teacher/admin
    if (['teacher', 'assistant', 'admin'].includes(this.currentUser.role)) {
      const teacherChannel = Echo.channel('teacher.notifications');

      teacherChannel
        .listen('.new.payment', (e: { notification: INotification }) => {
          console.log('Received new.payment notification:', e);
          this.zone.run(() => this.addNotification(e.notification));
        })
        .listen('.new.submission', (e: { notification: INotification }) => {
          console.log('Received new.submission notification:', e);
          this.zone.run(() => this.addNotification(e.notification));
        });

      console.log('Subscribed to teacher.notifications');
    }
  }

  private addNotification(notification: INotification): void {
    console.log('Received notification:', notification);

    // Run inside NgZone to ensure Angular detects the change
    this.zone.run(() => {
      const existing = this.notificationsSubject.value.some(n => n.id === notification.id);
      if (!existing) {
        console.log('Adding new notification');
        const updated = [notification, ...this.notificationsSubject.value];
        this.notificationsSubject.next(updated);

        // Show browser notification if supported
        this.showBrowserNotification(notification);

        console.log('Current notifications:', updated);
      } else {
        console.log('Notification already exists');
      }
    });
  }

  private showBrowserNotification(notification: INotification): void {
    if (this.isBrowser && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/assets/images/logo.png'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/assets/images/logo.png'
            });
          }
        });
      }
    }
  }

  public initializeNotifications(): void {
    this.checkAndInitializeEcho();
    this.loadNotifications();
  }

  // Start polling for notifications as a fallback
  private startPolling(): void {
    if (this.pollingSubscription) {
      return; // Already polling
    }

    console.log(`Starting notification polling every ${this.pollingInterval / 1000} seconds`);

    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(
        switchMap(() => {
          console.log('Polling for notifications...');
          return this.fetchNotifications();
        }),
        catchError(error => {
          console.error('Error polling for notifications:', error);
          return [];
        })
      )
      .subscribe();
  }

  // Stop polling when WebSocket is connected
  private stopPolling(): void {
    if (this.pollingSubscription) {
      console.log('Stopping notification polling');
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  // Fetch notifications without updating the subject (for polling)
  private fetchNotifications(): Observable<INotification[]> {
    if (!this.currentUser.token) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    let endpoint = '/notifications/student';
    if (['teacher', 'assistant', 'admin'].includes(this.currentUser.role)) {
      endpoint = '/notifications/teacher';
    }

    return this.http.get<{ status: string, data: INotification[] }>(`${this.apiUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap({
        next: (res) => {
          if (res.status === 'success') {
            // Only update if there are new notifications
            const currentNotifications = this.notificationsSubject.value;
            const newNotifications = res.data;

            // Check if there are any new notifications
            const hasNewNotifications = newNotifications.some(newNotif =>
              !currentNotifications.some(currentNotif => currentNotif.id === newNotif.id)
            );

            if (hasNewNotifications) {
              console.log('Polling found new notifications, updating...');
              this.notificationsSubject.next(newNotifications);
            }
          }
        },
        error: (err) => {
          console.error('Error fetching notifications:', err);
        }
      }),
      catchError(error => {
        console.error('Error in fetchNotifications:', error);
        return [];
      })
    );
  }

  // Clean up subscriptions
  public cleanup(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }

    if (this.connectionStatusSubscription) {
      this.connectionStatusSubscription.unsubscribe();
      this.connectionStatusSubscription = null;
    }

    // Disconnect Echo
    if (this.echoService.echo) {
      this.echoService.echo.disconnect();
    }
  }
}
