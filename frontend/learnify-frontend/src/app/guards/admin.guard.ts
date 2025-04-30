import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router,
    private toastr: ToastService
  ) {}

  canActivate(): boolean {
    const user = this.authService.currentUserValue;

    // تحقق من الـ role و المنع إذا كان Assistant
    if (user && user.role === 'teacher') {
      return true;
    } else if (user && user.role === 'assistant') {
      // لو الشخص Assistant نحوله لصفحة مختلفة مثلا
      this.toastr.warning('Only teachers can access this page !');
      return false;
    } else {
        this.toastr.warning('Only teachers can access this page !');
      this.router.navigate(['/']);
      return false;
    }
  }
}
