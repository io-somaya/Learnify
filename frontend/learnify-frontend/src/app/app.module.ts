import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, HttpClientModule } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';

@NgModule({
  declarations: [],
  imports: [BrowserModule, HttpClientModule, AiAssistantModule],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: []
})
export class AppModule { }
