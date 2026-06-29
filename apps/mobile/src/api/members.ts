import client from "./client";
import type { Member, MemberListItem, MemberSearchParams, PaginatedMembers } from "@/types/member";

export const membersApi = {
  list: async (params: MemberSearchParams = {}): Promise<PaginatedMembers> => {
    const { data } = await client.get<PaginatedMembers>("/members", { params });
    return data;
  },

  getById: async (id: string): Promise<Member> => {
    const { data } = await client.get<Member>(`/members/${id}`);
    return data;
  },

  getMyProfile: async (): Promise<Member> => {
    const { data } = await client.get<Member>("/members/me");
    return data;
  },
};
