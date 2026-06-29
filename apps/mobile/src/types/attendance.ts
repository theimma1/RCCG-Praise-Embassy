export interface AttendanceSession {
  id: string;
  event_id: string;
  campus_id: string;
  session_date: string;
  total_count: number;
  male_count: number;
  female_count: number;
  children_count: number;
  new_converts: number;
  first_timers: number;
  check_in_open: boolean;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
}

export interface CheckInRequest {
  attendance_type: "member" | "guest" | "first_timer";
  member_id?: string;
  guest_id?: string;
  anonymous_name?: string;
  check_in_method?: string;
}

export interface CheckInResponse {
  id: string;
  session_id: string;
  attendance_type: string;
  member_id: string | null;
  guest_id: string | null;
  anonymous_name: string | null;
  check_in_at: string;
  check_in_method: string;
}
