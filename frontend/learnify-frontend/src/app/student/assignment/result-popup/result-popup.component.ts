import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-popup.component.html',
  styleUrl: './result-popup.component.css'
})
export class ResultPopupComponent {
  @Input() result: any;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}