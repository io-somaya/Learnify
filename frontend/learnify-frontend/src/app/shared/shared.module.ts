import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationDropdownComponent } from '../../app/student/layout/notification-dropdown/notification-dropdown.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [
    NotificationDropdownComponent,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NotificationDropdownComponent,
    ClickOutsideDirective
  ]
})
export class SharedModule { }
