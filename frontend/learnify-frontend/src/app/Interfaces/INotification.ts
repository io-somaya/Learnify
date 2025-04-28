export interface INotification {
  id: number;
  user_id?: number;
  grade?: string;
  title: string;
  message: string;
  type: 'assignment' | 'lecture' | 'payment' | 'submission' | 'subscription';
  link: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}
