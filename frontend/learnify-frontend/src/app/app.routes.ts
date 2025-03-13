import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { RegisterComponent } from './formes/register/register.component';

export const routes: Routes = [
    //Admin routes 
    {
        path:"",
        component: RegisterComponent,
        title: "Register",
    },

    {path: "admin/dashboard", component: LayoutComponent,title: "Dashboard", 
        children: [{
            path: "",
            component:DashboardComponent,
            //loadComponet use to make lasyloading we can 
            // loadComponent:()=>import("./admin/dashboard/dashboard.component").then((C)=> C.DashboardComponent),
            title:"Dashboard"        
        },  
        ]
    },
    
// User routes



//Other routes

];
