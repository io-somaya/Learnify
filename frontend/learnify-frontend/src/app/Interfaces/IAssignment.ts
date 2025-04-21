export interface ILesson {
  id: number;
  title: string;
}

export interface IOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: number;
  created_at: string;
  updated_at: string;
}

export interface IQuestion {
  id: number;
  assignment_id: number;
  question_text: string;
  question_type: string;
  created_at: string;
  updated_at: string;
  options: IOption[];
}

export interface IAssignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  grade: string;
  lesson: {
    id: number;
    title: string;
  } | null;
  questions: IQuestion[];
  created_at: string;
  updated_at: string;
}

export interface IPagination {
  current_page: number;
  data: IQuestion[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface IAssignmentDetail {
  assignment: IAssignment;
  questions: IPagination;
}

export interface ISubmissionAnswer {
  question_id: number;
  option_id: number;
}

export interface ISubmissionPayload {
  answers: ISubmissionAnswer[];
}