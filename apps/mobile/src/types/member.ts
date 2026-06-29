export interface MemberListItem {
  id: string;
  full_name: string;
  email: string | null;
  phone_primary: string | null;
  status: string;
  discipleship_stage: string;
  worker_status: boolean;
  profile_photo_url: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  campus_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  preferred_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  marital_status: string | null;
  worker_status: boolean;
  discipleship_stage: string;
  occupation: string | null;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMembers {
  items: MemberListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MemberSearchParams {
  q?: string;
  status?: string;
  page?: number;
  page_size?: number;
}
