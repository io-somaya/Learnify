import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { RegisterComponent } from './formes/register/register.component';
import { LoginComponent } from './formes/login/login.component';
import { ForgotPasswordComponent } from './formes/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './formes/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { VerifyEmailComponent } from './formes/verify-email/verify-email.component';
import { CheckEmailComponent } from './formes/check-email/check-email.component';
import { ToastComponent } from './toast/toast.component';
import { PackagesComponent } from './packages&payments/packages/packages/packages.component';
import { ProfileComponent } from './student/profile/profile.component';
import { EditProfileComponent } from './student/edit-profile/edit-profile.component';
import { AdminLoginComponent } from './formes/admin-login/admin-login.component';
import { PaymentResultComponent } from './packages&payments/payments/payment-result/payment-result.component';
import { MakePackagesComponent } from './packages&payments/packages/make-packages/make-packages.component';
import { PackageUpdateComponent } from './packages&payments/packages/package-update/package-update.component';
import { PackageListComponent } from './packages&payments/packages/package-list/package-list.component';

export const routes: Routes = [
    // Auth routes
    {
        path: "",
        component: LoginComponent,
        title: "Login",
    },
    {
        path: "toast",
        component: ToastComponent,
        title: 'Toast'
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
    {
        path: "reset-password",
        component: ResetPasswordComponent,
        title: "Reset Password",
    },
    {
        path: "packages",
        component: PackagesComponent,
        title: "Packages",
    },
    {
        path: "payment-result",
        component: PaymentResultComponent,
        title: "Payment Result",
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
        },
        {
            path: "create-package",
            component: MakePackagesComponent,
            title: "Create Package"
        }, {
            path: "edit-package/:id",
            component: PackageUpdateComponent,
            title: "Edit Package"
        },
        {
            path: "packages-list",
            component: PackageListComponent,
            title: "Packages List"
        }]
    }, {
        path: "admin/login",
        component: AdminLoginComponent,
        title: "Admin Login"
    },

    //User routes
    {
        path: "profile",
        component: LayoutComponent,
        title: "Profile",
        children: [{
            path: "",
            component: ProfileComponent,
            title: "Profile"
        },
        {
            path: "edit",
            component: EditProfileComponent,
            title: "Edit Profile"
        }
        ]


    },

    // Other routes
    {
        path: '**',
        redirectTo: ''
    }
];
