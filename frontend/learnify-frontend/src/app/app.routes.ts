import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { RegisterComponent } from './formes/register/register.component';
import { LoginComponent } from './formes/login/login.component';
import { ForgotPasswordComponent } from './formes/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';
import { VerifyEmailComponent } from './formes/verify-email/verify-email.component';
import { CheckEmailComponent } from './formes/check-email/check-email.component';

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
        path: 'email/verify/:userId/:token',
        component: VerifyEmailComponent,
        title: 'Verify Email'
    },
    {
        path: 'check-email',
        component: CheckEmailComponent,
        title: 'Check Email'
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
        // canActivate: [authGuard],
        children: [{
            path: "",
            component: DashboardComponent,
            title: "Dashboard"
        }]
    },

    // User routes

    // Other routes
    {
        path: '**',
        redirectTo: ''
    }
];
