import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import type { MemberListItem } from "@/types/member";

const STAGE_LABELS: Record<string, string> = {
  new_convert: "New Convert",
  foundation: "Foundation",
  established: "Established",
  worker: "Worker",
  leader: "Leader",
};

interface MemberCardProps {
  member: MemberListItem;
  onPress?: () => void;
  showCheckIn?: boolean;
  onCheckIn?: () => void;
}

export default function MemberCard({
  member,
  onPress,
  showCheckIn,
  onCheckIn,
}: MemberCardProps) {
  const initials = member.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {member.profile_photo_url ? (
        <Image
          source={{ uri: member.profile_photo_url }}
          className="w-12 h-12 rounded-full"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-primary-800 items-center justify-center">
          <Text className="text-white font-bold text-base">{initials}</Text>
        </View>
      )}

      <View className="flex-1 ml-3">
        <Text className="text-slate-900 font-semibold text-base" numberOfLines={1}>
          {member.full_name}
        </Text>
        {member.phone_primary && (
          <Text className="text-slate-500 text-sm mt-0.5">{member.phone_primary}</Text>
        )}
        <View className="flex-row items-center mt-1 gap-2">
          <View className="bg-primary-50 rounded-full px-2 py-0.5">
            <Text className="text-primary-800 text-xs font-medium">
              {STAGE_LABELS[member.discipleship_stage] ?? member.discipleship_stage}
            </Text>
          </View>
          {member.worker_status && (
            <View className="bg-gold-300 rounded-full px-2 py-0.5">
              <Text className="text-primary-800 text-xs font-medium">Worker</Text>
            </View>
          )}
        </View>
      </View>

      {showCheckIn && (
        <TouchableOpacity
          className="bg-primary-800 rounded-xl px-3 py-2 ml-2"
          onPress={onCheckIn}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xs font-semibold">Check In</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
