import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ThemeColors {
  lightPink: string;
  lightPurple: string;
  mediumPurple: string;
  darkPurple: string;
  pageBackground: string;
  componentBackground: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly originalColors: ThemeColors = {
    lightPink: '#FEEEEF',
    lightPurple: '#ABB7DD',
    mediumPurple: '#7781B6',
    darkPurple: '#252E5F',
    pageBackground: '#f8f9fa',
    componentBackground: '#ffffff'
  };

  private readonly newColors: ThemeColors = {
    lightPink: '#FFF2F2',
    lightPurple: '#A9B5DF',
    mediumPurple: '#7886C7',
    darkPurple: '#2D336B',
    pageBackground: '#f8f9fa',
    componentBackground: '#ffffff'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Apply the new colors to the application
   */
  applyNewColors(): void {
    this.setColors(this.newColors);
  }

  /**
   * Revert to the original color scheme
   */
  revertToOriginalColors(): void {
    this.setColors(this.originalColors);
  }

  /**
   * Set application colors using CSS variables
   */
  private setColors(colors: ThemeColors): void {
    // Check if running in browser environment
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.setProperty('--light-pink', colors.lightPink);
      document.documentElement.style.setProperty('--light-purple', colors.lightPurple);
      document.documentElement.style.setProperty('--medium-purple', colors.mediumPurple);
      document.documentElement.style.setProperty('--dark-purple', colors.darkPurple);
      document.documentElement.style.setProperty('--page-background', colors.pageBackground);
      document.documentElement.style.setProperty('--component-background', colors.componentBackground);
      
      // Also set the legacy variables for components that might still use them
      document.documentElement.style.setProperty('--color-light-pink', colors.lightPink);
      document.documentElement.style.setProperty('--color-light-blue', colors.lightPurple);
      document.documentElement.style.setProperty('--color-medium-blue', colors.mediumPurple);
      document.documentElement.style.setProperty('--color-dark-blue', colors.darkPurple);
      
      // Force the body background color directly 
      document.body.style.backgroundColor = '#f8f9fa';
    }
  }
} 