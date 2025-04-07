import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { RegisterComponent } from './formes/register/register.component';
import { LoginComponent } from './formes/login/login.component';
import { ForgotPasswordComponent } from './formes/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Auth routes
    {
        path: "",
        component: LoginComponent,
        title: "Login",
    },
    {
        path: "register",
        component: RegisterComponent,
        title: "Register",
    },
    {
        path: "forgot-password",
        component: ForgotPasswordComponent,
        title: "Forgot Password",
    },

    // Admin routes (protected)
    {
        path: "admin/dashboard", 
        component: LayoutComponent,
        title: "Dashboard",
        canActivate: [authGuard],
        children: [{
            path: "",
            component: DashboardComponent,
            title: "Dashboard"        
        }]
    },
    
    // Student routes (protected)
    {
        path: "student",
        canActivate: [authGuard],
        loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
        title: "Student Portal"
    },

    // Other routes
    {
        path: '**',
        redirectTo: ''
    }
];
