import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { StudentModule } from './student/student.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    StudentModule,
    AppComponent
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: []
})
export class AppModule { }
