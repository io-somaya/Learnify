import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors, HttpClientModule } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AiAssistantModule],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
