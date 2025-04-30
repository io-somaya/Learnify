import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TeacherDashboardService } from '../../services/teacher-dashboard.service';
import { ITeacherDashboard } from '../../Interfaces/ITeacherDashboard';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private teacherDashboardService: TeacherDashboardService
  ) {}

  dashboardData: ITeacherDashboard | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  ngAfterViewInit(): void {
    // We'll initialize animations after data is loaded
  }

  /**
   * Fetches dashboard data from the API
   */
  fetchDashboardData(): void {
    this.loading = true;
    this.teacherDashboardService.getTeacherDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
        
        // Initialize chart animations after data is loaded (in browser only)
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.animateCounters(), 300);
        }
      },
      error: (err) => {
        if(err.message === 'Server Error (0): Failed to fetch'){
          this.error = 'Failed to load dashboard data. Please try again later.';
          this.loading = false;
        }else{

        
        this.error = err.message;
        this.loading = false;
      }
      }
    });
  }

  private animateCounters(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const counters = document.querySelectorAll('.counter');
    const speed = 200; 

    counters.forEach(counter => {
      const htmlElement = counter as HTMLElement;
      const target = +(htmlElement.getAttribute('data-target') || '0');
      
      const updateCount = () => {
        const currentCount = +htmlElement.innerText;
        
        if (currentCount < target) {
          const inc = Math.ceil(target / speed);
          htmlElement.innerText = (currentCount + inc).toString();
          setTimeout(updateCount, 25);
        } else {
          htmlElement.innerText = target.toString();
        }
      };
      
      updateCount();
    });
  }


  getGradeKeys(): string[] {
    if (!this.dashboardData?.grade_distribution) return [];
    return Object.keys(this.dashboardData.grade_distribution);
  }

  getGradePercentage(grade: string): number {
    if (!this.dashboardData?.grade_distribution) return 0;
    
    const totalStudents = this.dashboardData.stats.total_students;
    if (totalStudents === 0) return 0;
    
    const gradeStudents = this.dashboardData.grade_distribution[grade] || 0;
    return Math.round((gradeStudents / totalStudents) * 100);
  }

  
  getLowercaseGrade(grade: string): string {
    return grade.toLowerCase();
  }

  getSubscriptionPercentage(type: 'active' | 'expiring_soon' | 'expired'): number {
    if (!this.dashboardData?.subscription_stats) return 0;
    
    const total = this.dashboardData.subscription_stats.active + 
                  this.dashboardData.subscription_stats.expiring_soon + 
                  this.dashboardData.subscription_stats.expired;
    
    if (total === 0) return 0;
    
    return Math.round((this.dashboardData.subscription_stats[type] / total) * 100);
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000); // difference in seconds
    
    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`;
    } else {
      return `${Math.floor(diff / 86400)} days ago`;
    }
  }

  getMaxStudentCount(): number {
    if (!this.dashboardData?.trends?.student_growth?.length) {
      return 10;
    }
    
    return Math.max(
      ...this.dashboardData.trends.student_growth.map(item => item.count),
      5 );
  }

  getMaxSubscriptionCount(): number {
    if (!this.dashboardData?.trends?.subscriptions?.length) {
      return 10; 
    }
    
    return Math.max(
      ...this.dashboardData.trends.subscriptions.map(item => item.count),
      5 
    );
  }

  calculateBarHeight(value: number, max: number): number {
    return (value / max) * 100;
  }
}