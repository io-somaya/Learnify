import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TestimonialsComponent {
  testimonials = [
    {
      content: "Learnify has transformed how my students engage with course material. The interactive lessons and real-time feedback have made teaching more effective and enjoyable.",
      name: "Sarah Johnson",
      role: "High School Teacher",
      image: "assets/images/testimonial-1.jpg"
    },
    {
      content: "As a parent, I appreciate being able to track my child's progress. The platform is intuitive, and the regular updates help me stay involved in my daughter's education.",
      name: "Michael Chen",
      role: "Parent",
      image: "assets/images/testimonial-2.jpg"
    },
    {
      content: "The personalized learning paths helped me improve my grades significantly. I love how I can learn at my own pace and get immediate feedback on my assignments.",
      name: "Emily Rodriguez",
      role: "University Student",
      image: "assets/images/testimonial-3.jpg"
    }
  ];
}
