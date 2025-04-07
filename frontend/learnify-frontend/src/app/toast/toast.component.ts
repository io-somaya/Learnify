import { Component } from '@angular/core';
import {  ToastService } from '../services/toast.service';
import { CommonModule,  } from '@angular/common';
import {IToast} from '../Interfaces/IToast'

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  constructor(public _toastService: ToastService) {}

  getToastClass(toast: IToast): string {
    return `toast-${toast.type}`;
  }

  removeToast(toast: IToast): void {
    this._toastService.removeToast(toast);
  }
}