import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { IUserProfile } from '../../Interfaces/IUserProfile';
import { StudentDashboardService } from '../../services/student-dashboard.service';
import { IStudentDashboard, ILecture, IGradedAssignment } from '../../Interfaces/IStudentDashboard';
import { NotificationDropdownComponent } from '../../components/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule,NotificationDropdownComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  user: IUserProfile | null = null;
  studentDashboard: IStudentDashboard | null = null;
  isLoading = true;
  error: string | null = null;
  
  // Dashboard statistics
  enrolledCourses = 0;
  completedAssignments = 0;
  upcomingLectures = 0;
  completedLectures = 0;
  averageScore = 0;
  
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

  // Upcoming lectures from API
  upcomingLecturesList: ILecture[] = [];

  // Recent grades from API
  recentGrades: IGradedAssignment[] = [];

  // Notifications from API
  notificationsList: any[] = [];

  constructor(
    private profileService: ProfileService,
    private studentDashboardService: StudentDashboardService
  ) {}

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchStudentDashboardData();
  }

  fetchUserData(): void {
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.user = response;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.error = err.message || 'Failed to load profile data';
      }
    });
  }

  fetchStudentDashboardData(): void {
    this.studentDashboardService.getStudentDashboard().subscribe({
      next: (dashboardData) => {
        this.studentDashboard = dashboardData;
        this.isLoading = false;
        
        // Update component properties with API data
        this.updateDashboardStats();
        this.updateUpcomingLectures();
        this.updateRecentGrades();
        this.updateNotifications();
      },
      error: (err) => {
        console.error('Error fetching student dashboard:', err);
        this.error = err.message || 'Failed to load dashboard data';
        this.isLoading = false;
      }
    });
  }

  updateDashboardStats(): void {
    if (this.studentDashboard) {
      const stats = this.studentDashboard.quick_stats;
      this.completedAssignments = stats.completed_assignments;
      this.completedLectures = stats.completed_lectures;
      this.averageScore = parseFloat(stats.average_score);
      
      // Count upcoming lectures
      this.upcomingLectures = this.studentDashboard.upcoming.lectures.length;
    }
  }

  updateUpcomingLectures(): void {
    if (this.studentDashboard) {
      this.upcomingLecturesList = this.studentDashboard.upcoming.lectures;
    }
  }

  updateRecentGrades(): void {
    if (this.studentDashboard) {
      this.recentGrades = this.studentDashboard.academic.recent_grades;
    }
  }

  updateNotifications(): void {
    if (this.studentDashboard) {
      this.notificationsList = this.studentDashboard.notifications;
    }
  }

  changeTimeRange(range: string): void {
    this.selectedTimeRange = range;
    // In a real app, you would fetch new data based on the range
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
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

  // Helper method to get student name
  getStudentName(): string {
    if (this.studentDashboard?.profile?.user) {
      const { first_name, last_name } = this.studentDashboard.profile.user;
      return `${first_name} ${last_name}`;
    }
    return this.user ? `${this.user.first_name} ${this.user.last_name}` : 'Student';
  }

  // Helper method to format time (e.g., "09:00 AM - 10:00 AM")
  formatLectureTime(startTime: string, endTime: string): string {
    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  // Helper method to get the subscription status
  getSubscriptionStatus(): string {
    if (this.studentDashboard?.profile?.subscription_status) {
      const { is_active, package: subscriptionPackage, end_date } = this.studentDashboard.profile.subscription_status;
      
      if (is_active) {
        const endDate = new Date(end_date);
        const formattedDate = endDate.toLocaleDateString();
        return `Active (${subscriptionPackage.name}) - Expires on ${formattedDate}`;
      } else {
        return 'Inactive';
      }
    }
    return 'Unknown';
  }
}