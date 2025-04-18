import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { StudentProfileComponent } from './profile/profile.component';
import { StudentProfileEditComponent } from './profile-edit/profile-edit.component';
import { StudentPasswordChangeComponent } from './password-change/password-change.component';
import { StudentPhotoUploadComponent } from './photo-upload/photo-upload.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    
    // Standalone components
    StudentProfileComponent,
    StudentProfileEditComponent,
    StudentPasswordChangeComponent,
    StudentPhotoUploadComponent,
    DashboardHomeComponent,
    DashboardComponent
  ],
  exports: [
    StudentProfileComponent,
    StudentProfileEditComponent,
    StudentPasswordChangeComponent,
    StudentPhotoUploadComponent,
    DashboardHomeComponent,
    DashboardComponent
  ]
})
export class StudentModule { } 