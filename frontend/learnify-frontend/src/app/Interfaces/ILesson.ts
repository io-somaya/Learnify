export interface IMaterial {
    id: number;
    lesson_id: number;
    file_name: string;
    file_url: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ILesson {
    id: number;
    title: string;
    description: string;
    grade: string;
    youtube_embed_code?: string;
    created_at: string;
    updated_at: string;
    materials: IMaterial[];
  }
  
  export interface IPaginatedLessons {
    current_page: number;
    data: ILesson[];
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
  interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
  }