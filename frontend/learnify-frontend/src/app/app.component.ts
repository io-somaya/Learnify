import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { ThemeService } from './services/theme.service';
import { AiChatWidgetComponent } from './ai-assistant/ai-chat-widget/ai-chat-widget.component';
import { EchoService } from './services/echo.service';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OverlayModule, RouterOutlet, ToastComponent, AiChatWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private isBrowser: boolean;

  constructor(
    private themeService: ThemeService,
    private echoService: EchoService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Apply new color theme
    this.themeService.applyNewColors();

    if (this.isBrowser) {
      // Initialize Echo if user is logged in
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        this.echoService.initializeEcho();
      }

      // Listen for auth changes to initialize/disconnect Echo
      this.authService.currentUser.subscribe(user => {
        if (user) {
          this.echoService.initializeEcho();
        }
      });
    }
  }
}
