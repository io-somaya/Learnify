import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent as AdminDashboard } from './admin/dashboard/dashboard.component';
import { DashboardComponent as StudentDashboard } from './student/dashboard/dashboard.component';
import { RegisterComponent } from './formes/register/register.component';
import { LoginComponent } from './formes/login/login.component';
import { ForgotPasswordComponent } from './formes/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './formes/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { VerifyEmailComponent } from './formes/verify-email/verify-email.component';
import { CheckEmailComponent } from './formes/check-email/check-email.component';
import { ToastComponent } from './toast/toast.component';
import { PackagesComponent } from './packages&payments/packages/packages/packages.component';
// import { ProfileComponent } from './student/profile/profile.component';
// import { EditProfileComponent } from './student/edit-profile/edit-profile.component';
import { AdminLoginComponent } from './formes/admin-login/admin-login.component';
import { PaymentResultComponent } from './packages&payments/payments/payment-result/payment-result.component';
import { MakePackagesComponent } from './packages&payments/packages/make-packages/make-packages.component';
import { PackageUpdateComponent } from './packages&payments/packages/package-update/package-update.component';
import { PackageListComponent } from './packages&payments/packages/package-list/package-list.component';
import { SubscriptionListComponent } from './admin/subscription-list/subscription-list.component';
import { LessonListComponent } from './lessons/lesson-list/lesson-list.component';
import { LessonDetailComponent } from './lessons/lesson-detail/lesson-detail.component';
import { LessonManagementComponent } from './admin/lesson-management/lesson-management.component';
import { LectureListComponent } from './lecture-list/lecture-list.component';
import { LectureManagementComponent } from './admin/lecture-management/lecture-management.component';
import { AddLectureComponent } from './admin/lecture-management/add-lecture/add-lecture.component';
import { EditLectureComponent } from './admin/lecture-management/edit-lecture/edit-lecture.component';
// Import admin profile components
import { ProfileComponent as AdminProfileComponent } from './admin/profile/profile.component';
import { ProfileEditComponent } from './admin/profile-edit/profile-edit.component';
import { PasswordChangeComponent } from './admin/password-change/password-change.component';
import { PhotoUploadComponent } from './admin/photo-upload/photo-upload.component';
import { OrderHistoryComponent } from './student/order-history/order-history.component';

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
        title: 'Toaster'
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
    }, {
        path: "lessons-list",
        component: LessonListComponent,
        title: "Lessons List"

    }, 
    { path: 'lessons/:id',
    component: LessonDetailComponent
    , title: 'Lesson Detail' },
    {
        path: "lectures-list",
        component: LectureListComponent,
        title: "Lessons List"
    },

    // Admin routes (protected)
    {
        path: "admin/dashboard",
        component: LayoutComponent,
        title: "Dashboard",
        // canActivate: [authGuard],
        children: [{
            path: "",
            component: AdminDashboard,
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
        },
        {
            path: "subscriptions-list",
            component: SubscriptionListComponent,
            title: "Subscriptions List"
        },
        {
            path: "lectures-management",
            component: LectureManagementComponent,
            title: "lectures Management"
        },
        {
            path: "lessons-management",
            component: LessonManagementComponent,
            title: "Lessons Management"
        },
        {
            path: 'lectures-management',
            component: LectureManagementComponent,
            title: 'Lecture Management'
        },
        {
            path: 'lectures/add',
            component: AddLectureComponent,
            title: 'Add Lecture'
        },
        {
            path: 'lectures/edit/:id',
            component: EditLectureComponent,
            title: 'Edit Lecture'
        },
        // Admin Profile Routes
        {
            path: 'profile',
            component: AdminProfileComponent,
            title: 'Admin Profile'
        },
        {
            path: 'profile/edit',
            component: ProfileEditComponent,
            title: 'Edit Admin Profile'
        },
        {
            path: 'profile/password',
            component: PasswordChangeComponent,
            title: 'Change Password'
        },
        {
            path: 'profile/photo',
            component: PhotoUploadComponent,
            title: 'Update Profile Photo'
        }
        ]
    }, {
        path: "admin/login",
        component: AdminLoginComponent,
        title: "Admin Login"
    },
    //User routes
    // {
    //     path: "profile",
    //     component: LayoutComponent,
    //     title: "Profile",
    //     children: [{
    //         path: "",
    //         component: ProfileComponent,
    //         title: "Profile"
    //     },
    //     {
    //         path: "edit",
    //         component: EditProfileComponent,
    //         title: "Edit Profile"
    //     }
    //     ]


    // },
    
    // Student routes (protected)
    {
        path: "student/dashboard",
        component:StudentDashboard,
        title: "Student Portal",
        children: [{
            path: "",
            component: OrderHistoryComponent,
            title: "Dashboard"
        },

        //student profile routes need update
        {
            path: "profile",
            component: AdminProfileComponent,
            title: "Profile"
        },
        {
            path: "profile/edit",
            component: ProfileEditComponent,
            title: "Edit Profile"
        },
        {
            path: "profile/password",//for student
            component: PasswordChangeComponent,
            title: "Change Password"
        },
        {
            path: "profile/photo",
            component: PhotoUploadComponent,
            title: "Update Profile Photo"
        },
        {
            path: "lectures-list",
            component: LectureListComponent,
            title: "Lectures List"
        },
        {
            path: "packages",
            component: PackagesComponent,
            title: "Packages"
        },
        {
            path: "lessons-list",
            component: LessonListComponent,
            title: "Lessons List"
            },
            {
                path: "payment-result",
                component: PaymentResultComponent,
                title: "Payment Result",
            }
    ]
        
    },

    // Other routes
    {
        path: '**',
        redirectTo: ''
    }
];
