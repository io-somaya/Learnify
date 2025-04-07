import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeroComponent } from './layout/hero/hero.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StudentRoutingModule,
    DashboardComponent,
    OrderHistoryComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    HeroComponent
  ]
})
export class StudentModule { }
