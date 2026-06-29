import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import type { AuthStackScreenProps } from "@/types/navigation";

type Props = AuthStackScreenProps<"Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";

    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 8) {
      e.password = "Minimum 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      e.password = "Must contain at least one uppercase letter";
    } else if (!/\d/.test(password)) {
      e.password = "Must contain at least one number";
    }

    if (!confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const tokens = await authApi.register({
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
      });
      await SecureStore.setItemAsync("access_token", tokens.access_token);
      const user = await authApi.getMe();
      await setAuth(user, tokens.access_token, tokens.refresh_token);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      Alert.alert(
        "Registration Failed",
        typeof detail === "string" ? detail : "Could not create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <TouchableOpacity
            className="flex-row items-center px-6 pt-4 pb-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#1a237e" />
            <Text className="text-primary-800 ml-2 font-medium">Back to Login</Text>
          </TouchableOpacity>

          <View className="px-6 pt-4">
            <Text className="text-2xl font-bold text-slate-900 mb-1">Create account</Text>
            <Text className="text-slate-500 mb-8">
              Join the RCCG Praise Embassy community
            </Text>

            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Phone number (optional)"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              placeholder="+234 800 000 0000"
              keyboardType="phone-pad"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              secureTextEntry
            />

            <Input
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="Re-enter password"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <Button
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              className="mt-2"
            />

            <View className="flex-row justify-center mt-8 mb-4">
              <Text className="text-slate-500">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-primary-800 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
