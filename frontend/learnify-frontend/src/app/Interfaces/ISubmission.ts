export interface ISubmission {
    submission_id: number;
    student_id: number;
    first_name: string;
    last_name: string;
    student_email: string;
    score: string | null;
    status: 'graded' | 'submitted';
    submitted_at: string;
}

export interface ISubmissionResponse {
    data: ISubmission[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}