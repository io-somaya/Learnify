import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors, HttpClientModule } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { RouterModule } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { SharedModule } from './shared/shared.module';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AiAssistantModule,
    RouterModule.forRoot([]),
    SharedModule
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
