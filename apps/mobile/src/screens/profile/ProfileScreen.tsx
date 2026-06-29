import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { MainTabScreenProps } from "@/types/navigation";

type Props = MainTabScreenProps<"Profile">;

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  pastor: "Pastor",
  worker: "Worker",
  member: "Member",
  guest: "Guest",
};

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
  danger?: boolean;
  value?: string;
}

function SettingRow({ icon, label, onPress, danger, value }: SettingRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-slate-50 last:border-0"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${danger ? "bg-red-50" : "bg-slate-100"}`}>
        <Ionicons name={icon} size={18} color={danger ? "#dc2626" : "#475569"} />
      </View>
      <Text className={`flex-1 text-base font-medium ${danger ? "text-red-600" : "text-slate-800"}`}>
        {label}
      </Text>
      {value && <Text className="text-slate-400 text-sm mr-2">{value}</Text>}
      {!danger && <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePwLoading, setChangePwLoading] = useState(false);

  const initials = user?.email
    ?.split("@")[0]
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      Alert.alert("Error", "Password must be 8+ chars with 1 uppercase and 1 number");
      return;
    }

    setChangePwLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password updated successfully");
      setChangePasswordVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      Alert.alert("Error", typeof detail === "string" ? detail : "Failed to update password");
    } finally {
      setChangePwLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + info */}
        <View className="bg-primary-800 items-center pt-8 pb-12">
          <View className="w-24 h-24 rounded-full bg-gold-500 items-center justify-center mb-4">
            <Text className="text-primary-800 text-3xl font-black">{initials}</Text>
          </View>
          <Text className="text-white text-xl font-bold">{user?.email ?? ""}</Text>
          <View className="mt-2 bg-white/10 rounded-full px-4 py-1.5">
            <Text className="text-white text-sm font-medium">
              {ROLE_LABELS[user?.role ?? "member"] ?? user?.role}
            </Text>
          </View>
        </View>

        <View className="px-4 -mt-6">
          {/* Account */}
          <Card className="mb-4">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Account
            </Text>
            <SettingRow
              icon="mail-outline"
              label="Email"
              value={user?.email}
            />
            <SettingRow
              icon="shield-checkmark-outline"
              label="Account Status"
              value={user?.is_verified ? "Verified" : "Unverified"}
            />
            <SettingRow
              icon="lock-closed-outline"
              label="Change Password"
              onPress={() => setChangePasswordVisible(true)}
            />
          </Card>

          {/* Preferences */}
          <Card className="mb-4">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Preferences
            </Text>
            <SettingRow
              icon="notifications-outline"
              label="Push Notifications"
              onPress={() => {}}
            />
          </Card>

          {/* Danger zone */}
          <Card className="mb-8">
            <SettingRow
              icon="log-out-outline"
              label="Sign Out"
              danger
              onPress={handleLogout}
            />
          </Card>

          <Text className="text-center text-slate-400 text-xs mb-4">
            RCCG Praise Embassy · v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Change password modal */}
      <Modal
        visible={changePasswordVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setChangePasswordVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900">Change Password</Text>
              <TouchableOpacity onPress={() => setChangePasswordVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {[
              { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
              { label: "New Password", value: newPassword, setter: setNewPassword },
              { label: "Confirm New Password", value: confirmNewPassword, setter: setConfirmNewPassword },
            ].map(({ label, value, setter }) => (
              <View key={label} className="mb-4">
                <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-900"
                  value={value}
                  onChangeText={setter}
                  secureTextEntry
                  placeholderTextColor="#94a3b8"
                  placeholder="••••••••"
                />
              </View>
            ))}

            <Button
              label="Update Password"
              onPress={handleChangePassword}
              loading={changePwLoading}
              className="mt-2"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
