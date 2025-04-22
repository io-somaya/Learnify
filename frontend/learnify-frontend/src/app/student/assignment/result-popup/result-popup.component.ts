import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-popup.component.html',
  styleUrl: './result-popup.component.css'
})
export class ResultPopupComponent implements OnInit {
  @Input() submissionResult: any;
  @Output() close = new EventEmitter<void>();
  
  ngOnInit() {
    console.log('Submission Result received:', this.submissionResult);
  }

  getResultData() {
    // Handle different possible structures of the response
    if (this.submissionResult?.data?.correct_answers !== undefined) {
      return this.submissionResult.data;
    } 
    // For when the data property itself contains the metrics
    else if (this.submissionResult?.correct_answers !== undefined) {
      return this.submissionResult;
    }
    
    return null;
  }

  onClose() {
    this.close.emit();
  }
}