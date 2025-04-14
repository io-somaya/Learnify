export interface ILecture {
  id?: number;
  title: string;
  description: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  grade: string;
  is_active: string;  // Changed to string to match '0' or '1' values
  zoom_link?: string;
  zoom_meeting_id?: string;
  zoom_start_url?: string;
}
