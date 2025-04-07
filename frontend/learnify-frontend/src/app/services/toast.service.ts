import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IToast } from '../Interfaces/IToast';


@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<IToast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private defaultDuration = 3000; // 3 seconds

  show(toast: IToast): void {
    const currentToasts = this.toastsSubject.value;
    const newToasts = [...currentToasts, toast];
    this.toastsSubject.next(newToasts);

    // Auto dismiss after duration
    setTimeout(() => {
      this.removeToast(toast);
    }, toast.duration || this.defaultDuration);
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  removeToast(toast: IToast): void {
    const currentToasts = this.toastsSubject.value;
    const newToasts = currentToasts.filter(t => t !== toast);
    this.toastsSubject.next(newToasts);
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}