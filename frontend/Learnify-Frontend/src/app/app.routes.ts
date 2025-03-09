import { Routes } from '@angular/router';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
    {path: "dashboard", component: LayoutComponent,title: "Dashboard", 
        children: [{
            path: "",
            component:DashboardComponent
            
        }]}
];
