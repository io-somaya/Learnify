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

export interface IPaginatedUsers {
  current_page: number;
  data: IUserProfile[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}