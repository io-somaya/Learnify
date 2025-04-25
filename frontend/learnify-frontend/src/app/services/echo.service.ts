import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  initializeEcho() {
    // Skip initialization if not in browser or already initialized
    if (!this.isBrowser || this.isInitialized) {
      return;
    }

    // Check if we have the required libraries
    if (!window.Pusher) {
      console.error('Pusher.js is not loaded. Make sure to include it in your project.');
      return;
    }

    try {
      // Import Echo and Pusher dynamically
      import('laravel-echo').then(module => {
        const Echo = module.default;

        // Initialize Echo with Reverb configuration
        window.Echo = new Echo({
          broadcaster: 'reverb',
          key: environment.reverbKey || '4rndt4osujmu7kg8yng3',
          wsHost: environment.reverbHost || 'localhost',
          wsPort: environment.reverbPort || 8080,
          forceTLS: false,
          enabledTransports: ['ws', 'wss']
        });

        console.log('Laravel Echo initialized successfully with Reverb');
        this.isInitialized = true;
      }).catch(error => {
        console.error('Failed to import Laravel Echo:', error);
      });
    } catch (error) {
      console.error('Error initializing Echo:', error);
    }
  }

  get isEchoInitialized(): boolean {
    return this.isInitialized;
  }
}
