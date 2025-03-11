import { Routes } from '@angular/router';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
//Admin routes 
    // {
    //     path:"admin/login",
    //     component: LoginComponent,
    //     title: "Login Admin"
    // },

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
