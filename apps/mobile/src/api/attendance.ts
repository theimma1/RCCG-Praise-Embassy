import client from "./client";
import type {
  AttendanceSession,
  CheckInRequest,
  CheckInResponse,
} from "@/types/attendance";

export const attendanceApi = {
  listSessions: async (checkInOpen?: boolean): Promise<AttendanceSession[]> => {
    const params: Record<string, unknown> = {};
    if (checkInOpen !== undefined) params.check_in_open = checkInOpen;
    const { data } = await client.get<AttendanceSession[]>("/attendance/sessions", { params });
    return data;
  },

  getSession: async (sessionId: string): Promise<AttendanceSession> => {
    const { data } = await client.get<AttendanceSession>(`/attendance/sessions/${sessionId}`);
    return data;
  },

  checkIn: async (sessionId: string, payload: CheckInRequest): Promise<CheckInResponse> => {
    const { data } = await client.post<CheckInResponse>(
      `/attendance/sessions/${sessionId}/check-in`,
      payload
    );
    return data;
  },

  closeSession: async (sessionId: string): Promise<AttendanceSession> => {
    const { data } = await client.post<AttendanceSession>(
      `/attendance/sessions/${sessionId}/close`
    );
    return data;
  },
};
