
export interface IToast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}