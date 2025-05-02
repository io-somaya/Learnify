import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FeaturesComponent {
  features = [
    {
      icon: 'bi bi-book',
      title: 'Interactive Lessons',
      description: 'Engage with dynamic content that adapts to your learning style and pace.'
    },
    {
      icon: 'bi bi-camera-video',
      title: 'Live Sessions',
      description: 'Connect with teachers in real-time for personalized instruction and support.'
    },
    {
      icon: 'bi bi-clipboard-check',
      title: 'Assignments & Quizzes',
      description: 'Track progress with comprehensive assessments and immediate feedback.'
    },
    {
      icon: 'bi bi-graph-up',
      title: 'Progress Tracking',
      description: 'Monitor learning achievements with detailed analytics and insights.'
    },
    {
      icon: 'bi bi-people',
      title: 'Parent Involvement',
      description: 'Keep parents informed and engaged in their child\'s educational journey.'
    },
    {
      icon: 'bi bi-calendar-check',
      title: 'Personalized Schedules',
      description: 'Create customized learning plans that fit your unique needs and goals.'
    }
  ];
}
