
export interface IStudentDashboardResponse {
    status: number;
    message: string;
    data: IStudentDashboard;
  }
  
  export interface IStudentDashboard {
    profile: {
      user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        email_verified_at: string;
        phone_number: string;
        parent_phone: string;
        grade: string;
        role: string;
        status: string;
        profile_picture: string | null;
        google_id: string | null;
        created_at: string;
        updated_at: string;
      };
      subscription_status: {
        is_active: boolean;
        package: {
          id: number;
          name: string;
          price: string;
          duration_days: number;
        };
        end_date: string;
      };
    };
    upcoming: {
      lectures: ILecture[];
      assignments: IAssignment[];
    };
    academic: {
      recent_grades: IGradedAssignment[];
      graded_assignments: IGradedAssignment[];
    };
    notifications: INotification[];
    quick_stats: {
      completed_assignments: number;
      completed_lectures: number;
      average_score: string;
    };
  }
  
  export interface ILecture {
    id: number;
    title: string;
    description: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    zoom_link: string;
  }
  
  export interface IAssignment {
    id: number;
    title: string;
    description?: string;
    due_date?: string;
    status?: string;
  }
  
  export interface IGradedAssignment {
    id: number;
    assignment_id: number;
    score: string;
    submit_time: string;
    status?: string;
    user_id?: number;
    created_at?: string;
    updated_at?: string;
    assignment: {
      id: number;
      title: string;
    };
  }
  
  export interface INotification {
    id: number;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
  }