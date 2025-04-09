export interface ILecture {
  id?: number;
  title: string;
  description?: string; 
  day_of_week: string;
  start_time: string;
  end_time: string;
  grade?: string;
  zoom_link?: string; 
  is_active?: boolean;
}