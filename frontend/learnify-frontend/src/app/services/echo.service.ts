import { Injectable, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EchoService {
  private isInitialized = false;
  private isBrowser: boolean;
  private reconnectTimer: any = null;
  private initializationPromise: Promise<void> | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private reconnectInterval = 3000; // 3 seconds

  // Connection status observable
  private connectionStatusSubject = new BehaviorSubject<string>('disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // If in browser, check if Pusher is loaded
    if (this.isBrowser && !window.Pusher) {
      console.error('Pusher.js is not loaded! Make sure it is included in your index.html');
    }
  }

  initializeEcho(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    // If already initialized and connected, return the existing promise
    if (this.initializationPromise && this.isInitialized) {
      return this.initializationPromise;
    }

    // Reset the initialization promise
    this.initializationPromise = new Promise((resolve, reject) => {
      this.zone.runOutsideAngular(() => {
        // First, disconnect any existing connection
        if (window.Echo) {
          console.log('Disconnecting existing Echo instance');
          try {
            window.Echo.disconnect();
          } catch (e) {
            console.warn('Error disconnecting Echo:', e);
          }
        }

        // Update connection status
        this.zone.run(() => this.connectionStatusSubject.next('connecting'));

        console.log('Initializing Laravel Echo with Reverb...');

        // Import Laravel Echo dynamically
        import('laravel-echo').then(module => {
          const Echo = module.default;

          // Check if Pusher is available
          if (!window.Pusher) {
            const errorMsg = 'Pusher.js is not loaded! Make sure it is included in your index.html';
            console.error(errorMsg);
            this.zone.run(() => this.connectionStatusSubject.next('error'));
            reject(new Error(errorMsg));
            return;
          }

          // Create new Echo instance
          try {
            window.Echo = new Echo({
              broadcaster: 'reverb',
              key: environment.reverbKey,
              wsHost: environment.reverbHost,
              wsPort: environment.reverbPort,
              forceTLS: false,
              enabledTransports: ['ws', 'wss'],
              disableStats: true,
              authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
              auth: {
                headers: {
                  Authorization: this.getAuthToken()
                }
              }
            });

            console.log('Echo instance created with config:', {
              key: environment.reverbKey,
              wsHost: environment.reverbHost,
              wsPort: environment.reverbPort,
              authEndpoint: `${environment.apiUrl}/broadcasting/auth`
            });

            // Set up connection event handlers
            window.Echo.connector.socket.on('connect', () => {
              this.zone.run(() => {
                console.log('✅ Connected to Reverb WebSocket!');
                this.isInitialized = true;
                this.reconnectAttempts = 0;
                this.connectionStatusSubject.next('connected');

                // Clear any reconnect timer
                if (this.reconnectTimer) {
                  clearTimeout(this.reconnectTimer);
                  this.reconnectTimer = null;
                }

                resolve();
              });
            });

            window.Echo.connector.socket.on('disconnect', () => {
              this.zone.run(() => {
                console.log('❌ Disconnected from Reverb WebSocket!');
                this.isInitialized = false;
                this.connectionStatusSubject.next('disconnected');

                // Try to reconnect
                this.setupReconnect();
              });
            });

            window.Echo.connector.socket.on('error', (error: any) => {
              this.zone.run(() => {
                console.error('⚠️ WebSocket connection error:', error);
                this.isInitialized = false;
                this.connectionStatusSubject.next('error');

                // Try to reconnect
                this.setupReconnect();

                reject(error);
              });
            });

            // Add subscription succeeded handler for debugging
            window.Echo.connector.pusher.connection.bind('connected', () => {
              console.log('Pusher connection established');
            });

            // Add subscription error handler for debugging
            window.Echo.connector.pusher.connection.bind('error', (error: any) => {
              console.error('Pusher connection error:', error);
            });

          } catch (error) {
            console.error('Failed to create Echo instance:', error);
            this.zone.run(() => this.connectionStatusSubject.next('error'));
            reject(error);
          }
        }).catch(error => {
          console.error('Error loading laravel-echo:', error);
          this.zone.run(() => this.connectionStatusSubject.next('error'));
          reject(error);
        });
      });
    });

    return this.initializationPromise;
  }

  private setupReconnect(): void {
    // Only set up reconnect if we don't already have one pending
    if (!this.reconnectTimer) {
      this.reconnectAttempts++;

      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval}ms`);

        this.reconnectTimer = setTimeout(() => {
          console.log(`Attempting to reconnect to WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          this.initializationPromise = null; // Reset so we can initialize again
          this.initializeEcho();
          this.reconnectTimer = null;
        }, this.reconnectInterval);
      } else {
        console.warn('Maximum reconnect attempts reached. Giving up.');
        this.connectionStatusSubject.next('failed');
      }
    }
  }

  private getAuthToken(): string {
    if (!this.isBrowser) {
      return '';
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return currentUser.token ? `Bearer ${currentUser.token}` : '';
    } catch (e) {
      console.error('Error getting auth token:', e);
      return '';
    }
  }

  get isEchoInitialized(): boolean {
    return this.isInitialized;
  }

  get echo(): any {
    return this.isBrowser ? window.Echo : null;
  }

  // Force reconnection
  reconnect(): Promise<void> {
    console.log('Forcing reconnection to WebSocket...');
    this.initializationPromise = null;
    this.isInitialized = false;
    this.reconnectAttempts = 0;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    return this.initializeEcho();
  }
}