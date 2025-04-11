import { Component, OnInit } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './toast/toast.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OverlayModule,RouterOutlet,ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Apply new color theme
    this.themeService.applyNewColors();
  }
}
