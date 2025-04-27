// src/app/Interfaces/ITeacherDashboard.ts

export interface ITeacherDashboardResponse {
    status: number;
    message: string;
    data: ITeacherDashboard;
  }
  
  export interface ITeacherDashboard {
    user: IUser;
    stats: IDashboardStats;
    grade_distribution: Record<string, number>;
    subscription_stats: ISubscriptionStats;
    recent_activities: IActivity[];
    upcoming_schedule: IScheduleItem[];
    trends: ITrends;
  }
  
  export interface IUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at: string | null;
    phone_number: string;
    parent_phone: string | null;
    grade: string | null;
    role: string;
    status: string;
    profile_picture: string | null;
    google_id: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface IDashboardStats {
    total_students: number;
    active_subscriptions: number;
    recent_payments: number;
    upcoming_lectures: number;
    pending_assignments: number;
    new_registrations: number;
    total_lessons: number;
  }
  
  export interface ISubscriptionStats {
    active: number;
    expiring_soon: number;
    expired: number;
  }
  
  export interface IActivity {
    type: string;
    message: string;
    time: string;
  }
  
  export interface IScheduleItem {
    title: string;
    day: string;
    time: string;
    grade: string;
  }
  
  export interface ITrends {
    student_growth: ITrendItem[];
    subscriptions: ITrendItem[];
  }
  
  export interface ITrendItem {
    date: string;
    count: number;
  }