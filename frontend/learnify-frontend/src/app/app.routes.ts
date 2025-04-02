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
import { PaymentComponent } from './components/payment/payment.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';

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
  { path: 'payment', component: PaymentComponent },
  { path: 'payment/result', component: PaymentResultComponent },
  // User routes

  // Other routes
  {
    path: '**',
    redirectTo: ''
  }
];
