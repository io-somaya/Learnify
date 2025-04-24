import { Component, OnInit } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { ThemeService } from './services/theme.service';
import { AiChatWidgetComponent } from './ai-assistant/ai-chat-widget/ai-chat-widget.component';
import { NotificationService } from '../app/services/notification.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OverlayModule, RouterOutlet, ToastComponent, AiChatWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    // Apply new color theme
    this.themeService.applyNewColors();
  }
}
