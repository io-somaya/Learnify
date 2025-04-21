export interface ISubmissionDetail {
  submission_id: number;
  assignment_id: number;
  assignment_title: string;
  score: string;
  status: string;
  submitted_at: string | null;
  questions: ISubmissionQuestion[];
}

export interface ISubmissionQuestion {
  id: number;
  question_text: string;
  options: IQuestionOption[];
  student_answer: IStudentAnswer;
  correct_options: IQuestionOption[];
}

export interface IQuestionOption {
  id: number;
  option_text: string;
}

export interface IStudentAnswer {
  selected_option_id: number;
  selected_option_text: string;
  is_correct: boolean;
}