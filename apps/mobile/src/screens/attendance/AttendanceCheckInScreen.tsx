import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/api/attendance";
import { membersApi } from "@/api/members";
import type { AttendanceSession } from "@/types/attendance";
import type { MemberListItem } from "@/types/member";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MemberCard from "@/components/MemberCard";

export default function AttendanceCheckInScreen() {
  const qc = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => attendanceApi.listSessions(true),
  });

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["member-search", debouncedQuery],
    queryFn: () => membersApi.list({ q: debouncedQuery, page: 1, page_size: 15 }),
    enabled: debouncedQuery.length >= 2,
  });

  const checkInMutation = useMutation({
    mutationFn: ({ memberId }: { memberId: string }) =>
      attendanceApi.checkIn(selectedSession!.id, {
        attendance_type: "member",
        member_id: memberId,
        check_in_method: "manual",
      }),
    onSuccess: (_, { memberId }) => {
      const member = membersData?.items.find((m) => m.id === memberId);
      Alert.alert("Checked In ✓", `${member?.full_name ?? "Member"} has been checked in.`);
      qc.invalidateQueries({ queryKey: ["active-sessions"] });
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      Alert.alert(
        "Check-in Failed",
        typeof detail === "string" ? detail : "Unable to complete check-in"
      );
    },
  });

  const handleSearch = useCallback((text: string) => {
    setMemberQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(text), 400);
  }, []);

  const handleCheckIn = (member: MemberListItem) => {
    if (!selectedSession) return;
    Alert.alert(
      "Confirm Check-in",
      `Check in ${member.full_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check In",
          onPress: () => checkInMutation.mutate({ memberId: member.id }),
        },
      ]
    );
  };

  if (sessionsLoading) return <LoadingSpinner fullScreen message="Loading sessions..." />;

  if (!sessions || sessions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6" edges={["bottom"]}>
        <Ionicons name="calendar-outline" size={56} color="#cbd5e1" />
        <Text className="text-slate-700 text-xl font-semibold mt-4 text-center">
          No Active Sessions
        </Text>
        <Text className="text-slate-400 text-base mt-2 text-center">
          There are no open attendance sessions right now. Ask an admin to open one.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <View className="flex-1">
        {/* Session picker */}
        <View className="bg-primary-800 px-4 pb-4 pt-2">
          <Text className="text-blue-200 text-xs font-medium mb-2">SELECT SESSION</Text>
          <FlatList
            horizontal
            data={sessions}
            keyExtractor={(s) => s.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`mr-2 px-4 py-2.5 rounded-xl border ${
                  selectedSession?.id === item.id
                    ? "bg-gold-500 border-gold-700"
                    : "bg-white/10 border-white/20"
                }`}
                onPress={() => setSelectedSession(item)}
                activeOpacity={0.8}
              >
                <Text className={`font-semibold text-sm ${selectedSession?.id === item.id ? "text-primary-800" : "text-white"}`}>
                  {new Date(item.session_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text className={`text-xs mt-0.5 ${selectedSession?.id === item.id ? "text-primary-800" : "text-blue-200"}`}>
                  {item.total_count} checked in
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {!selectedSession ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="hand-left-outline" size={48} color="#cbd5e1" />
            <Text className="text-slate-500 text-base mt-3 text-center">
              Select a session above to start checking in members
            </Text>
          </View>
        ) : (
          <View className="flex-1">
            {/* Session summary */}
            <Card className="mx-4 mt-4 mb-2">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-slate-500 text-xs">Session Total</Text>
                  <Text className="text-3xl font-bold text-primary-800">
                    {selectedSession.total_count}
                  </Text>
                </View>
                <View className="flex-row gap-4">
                  <View className="items-center">
                    <Text className="text-xs text-slate-500">First Timers</Text>
                    <Text className="text-lg font-bold text-gold-500">{selectedSession.first_timers}</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs text-slate-500">Converts</Text>
                    <Text className="text-lg font-bold text-green-600">{selectedSession.new_converts}</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Member search */}
            <View className="px-4 py-2">
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                <Ionicons name="search" size={18} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-2 text-slate-900 text-base"
                  placeholder="Search member by name..."
                  placeholderTextColor="#94a3b8"
                  value={memberQuery}
                  onChangeText={handleSearch}
                  autoCorrect={false}
                />
                {memberQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setMemberQuery(""); setDebouncedQuery(""); }}>
                    <Ionicons name="close-circle" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {debouncedQuery.length < 2 ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="search-outline" size={40} color="#e2e8f0" />
                <Text className="text-slate-400 mt-2 text-sm">
                  Type at least 2 characters to search
                </Text>
              </View>
            ) : membersLoading ? (
              <LoadingSpinner message="Searching..." />
            ) : (
              <FlatList<MemberListItem>
                data={membersData?.items ?? []}
                keyExtractor={(m) => m.id}
                contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
                renderItem={({ item }) => (
                  <MemberCard
                    member={item}
                    showCheckIn
                    onCheckIn={() => handleCheckIn(item)}
                  />
                )}
                ListEmptyComponent={
                  <View className="items-center pt-8">
                    <Ionicons name="person-outline" size={40} color="#cbd5e1" />
                    <Text className="text-slate-400 mt-2">No members found</Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
