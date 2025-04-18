import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { IUserProfile } from '../../Interfaces/IUserProfile';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  user: IUserProfile | null = null;
  isLoading = true;
  error: string | null = null;
  
  // Dashboard statistics
  enrolledCourses = 0;
  completedCourses = 0;
  upcomingLectures = 0;
  quizzesTaken = 0;
  
  // Sample data for analytics
  selectedTimeRange = 'week';
  learningProgressData = [
    { label: 'Mon', hours: 2, percentage: 40 },
    { label: 'Tue', hours: 3, percentage: 60 },
    { label: 'Wed', hours: 1, percentage: 20 },
    { label: 'Thu', hours: 4, percentage: 80 },
    { label: 'Fri', hours: 2, percentage: 40 },
    { label: 'Sat', hours: 0, percentage: 0 },
    { label: 'Sun', hours: 1, percentage: 20 }
  ];
  
  // Course completion data
  completionRate = 65;
  inProgressCoursesCount = 3;
  
  // Performance metrics
  averageQuizScore = 82;
  quizScoreTrend = 5;
  totalLearningHours = 45;
  learningTimeTrend = 10;
  learningStreak = 5;
  bestStreak = 14;
  attendanceRate = 90;
  attendanceTrend = -2;
  
  // Calendar data
  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  activityHeatmap = Array.from({ length: 30 }, (_, i) => ({
    date: `2023-06-${(i + 1).toString().padStart(2, '0')}`,
    hours: Math.floor(Math.random() * 5),
    level: Math.floor(Math.random() * 5)
  }));

  // Upcoming events data
  upcomingEvents = [
    {
      title: 'Advanced JavaScript Lecture',
      day: '15',
      month: 'Jun',
      time: '14:00 - 15:30',
      type: 'lecture',
      canJoin: false
    },
    {
      title: 'Angular Components Quiz',
      day: '18',
      month: 'Jun',
      time: '10:00 - 11:00',
      type: 'quiz',
      canJoin: false
    },
    {
      title: 'React State Management',
      day: '20',
      month: 'Jun',
      time: '09:30 - 11:00',
      type: 'lecture',
      canJoin: true
    }
  ];

  // Sample recent activities - this would come from an API in a real app
  recentActivities = [
    { type: 'course', action: 'enrolled', title: 'React Advanced Guide', date: new Date() },
    { type: 'lecture', action: 'attended', title: 'JavaScript Fundamentals', date: new Date(Date.now() - 86400000) },
    { type: 'quiz', action: 'completed', title: 'CSS Grid Quiz', date: new Date(Date.now() - 172800000) }
  ];
  
  // Sample recommended courses with progress
  recommendedCourses = [
    { 
      id: 1, 
      title: 'Vue.js for Beginners', 
      progress: 35, 
      image: 'assets/images/vue.jpg' 
    },
    { 
      id: 2, 
      title: 'Advanced TypeScript', 
      progress: 0, 
      image: 'assets/images/typescript.jpg' 
    },
    { 
      id: 3, 
      title: 'Node.js Backend Development', 
      progress: 72, 
      image: 'assets/images/nodejs.jpg' 
    }
  ];

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchDashboardStats();
  }

  fetchUserData(): void {
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.user = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error = err.message || 'Failed to load profile data';
        this.isLoading = false;
      }
    });
  }

  fetchDashboardStats(): void {
    // This would be an API call in a real app
    // For now, we'll use mock data
    setTimeout(() => {
      this.enrolledCourses = 5;
      this.completedCourses = 2;
      this.upcomingLectures = 3;
      this.quizzesTaken = 8;
    }, 1000);
  }

  changeTimeRange(range: string): void {
    this.selectedTimeRange = range;
    // In a real app, you would fetch new data based on the range
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    
    return `${Math.floor(months / 12)} years ago`;
  }
} 