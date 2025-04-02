import { Component } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './toast/toast.component';

@Component({
    selector: 'app-root',
    imports: [OverlayModule, RouterOutlet, ToastComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {}
