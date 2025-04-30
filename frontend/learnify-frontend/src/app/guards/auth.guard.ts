import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
     private router: Router
    , private toastr:ToastService
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {

      return true;

    } else {
      this.router.navigate(['/']);
      this.toastr.warning('Please log in to continue.');
      return false;
    }
  }
}
