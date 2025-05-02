import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class StatsComponent {
  stats = [
    {
      value: '10K+',
      label: 'Active Students',
      icon: 'bi bi-people-fill'
    },
    {
      value: '500+',
      label: 'Expert Teachers',
      icon: 'bi bi-person-workspace'
    },
    {
      value: '1000+',
      label: 'Interactive Lessons',
      icon: 'bi bi-journal-richtext'
    },
    {
      value: '95%',
      label: 'Satisfaction Rate',
      icon: 'bi bi-emoji-smile-fill'
    }
  ];
}
