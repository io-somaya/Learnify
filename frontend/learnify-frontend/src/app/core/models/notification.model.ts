export interface NotificationModel {
  id: number;
  user_id?: number;
  grade?: string;
  title: string;
  message: string;
  type: 'assignment' | 'lecture' | 'payment' | 'submission';
  link?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}
