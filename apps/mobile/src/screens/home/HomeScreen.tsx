import React from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { membersApi } from "@/api/members";
import { attendanceApi } from "@/api/attendance";
import Card from "@/components/ui/Card";
import type { MainTabScreenProps } from "@/types/navigation";

type Props = MainTabScreenProps<"Home">;

function StatCard({ label, value, icon, color }: {
  label: string;
  value: number | string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return (
    <Card className="flex-1 mx-1">
      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3`} style={{ backgroundColor: color + "20" }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-slate-900">{value}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">{label}</Text>
    </Card>
  );
}

function QuickAction({ label, icon, color, onPress }: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="items-center flex-1"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: color + "15" }}
      >
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text className="text-xs font-medium text-slate-600 text-center">{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);

  const { data: membersData, refetch: refetchMembers, isRefetching } = useQuery({
    queryKey: ["members-count"],
    queryFn: () => membersApi.list({ page: 1, page_size: 1 }),
  });

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: () => attendanceApi.listSessions(true),
  });

  const refetch = () => {
    refetchMembers();
    refetchSessions();
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const displayName = user?.email?.split("@")[0] ?? "Member";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1a237e" />
        }
      >
        {/* Greeting */}
        <View className="bg-primary-800 px-6 pt-6 pb-8">
          <Text className="text-blue-200 text-sm">{today}</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            Good day, {displayName} 👋
          </Text>
          {user?.role && (
            <View className="mt-3 self-start bg-white/10 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium capitalize">{user.role.replace("_", " ")}</Text>
            </View>
          )}
        </View>

        <View className="px-4 -mt-5">
          {/* Stats */}
          <View className="flex-row mb-4">
            <StatCard
              label="Total Members"
              value={membersData?.total ?? "—"}
              icon="people"
              color="#1a237e"
            />
            <StatCard
              label="Active Sessions"
              value={sessions?.length ?? "—"}
              icon="checkmark-circle"
              color="#f9a825"
            />
            <StatCard
              label="New Today"
              value={0}
              icon="person-add"
              color="#10b981"
            />
          </View>

          {/* Quick Actions */}
          <Card className="mb-4">
            <Text className="font-semibold text-slate-900 mb-4">Quick Actions</Text>
            <View className="flex-row justify-around">
              <QuickAction
                label="Check In"
                icon="checkmark-done-circle"
                color="#1a237e"
                onPress={() => navigation.navigate("Attendance")}
              />
              <QuickAction
                label="Members"
                icon="people"
                color="#3f51b5"
                onPress={() => navigation.navigate("Members")}
              />
              <QuickAction
                label="Give"
                icon="heart"
                color="#f9a825"
                onPress={() => {}}
              />
              <QuickAction
                label="Pray"
                icon="hand-left"
                color="#10b981"
                onPress={() => {}}
              />
            </View>
          </Card>

          {/* Active Sessions Banner */}
          {sessions && sessions.length > 0 && (
            <TouchableOpacity
              className="bg-primary-800 rounded-2xl p-4 mb-4 flex-row items-center"
              onPress={() => navigation.navigate("Attendance")}
              activeOpacity={0.8}
            >
              <View className="bg-white/10 rounded-xl p-2 mr-3">
                <Ionicons name="radio" size={24} color="#f9a825" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">Check-in Open</Text>
                <Text className="text-blue-200 text-sm mt-0.5">
                  {sessions.length} active session{sessions.length > 1 ? "s" : ""} — tap to check in
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93c5fd" />
            </TouchableOpacity>
          )}

          {/* Footer space */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
