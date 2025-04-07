export interface IUserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  phone_number: string;
  parent_phone: string;
  grade: string;
  role: string;
  status: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}