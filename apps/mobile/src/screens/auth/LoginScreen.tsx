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
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import type { AuthStackScreenProps } from "@/types/navigation";

type Props = AuthStackScreenProps<"Login">;

export default function LoginScreen({ navigation }: Props) {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const tokens = await authApi.login({ email: email.trim().toLowerCase(), password });
      await SecureStore.setItemAsync("access_token", tokens.access_token);
      const user = await authApi.getMe();
      await setAuth(user, tokens.access_token, tokens.refresh_token);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      Alert.alert(
        "Login Failed",
        typeof detail === "string" ? detail : "Invalid email or password"
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="bg-primary-800 pt-16 pb-12 px-6 items-center">
            <View className="w-20 h-20 bg-gold-500 rounded-full items-center justify-center mb-4">
              <Text className="text-primary-800 text-3xl font-black">PE</Text>
            </View>
            <Text className="text-white text-2xl font-bold">RCCG Praise Embassy</Text>
            <Text className="text-blue-200 text-sm mt-1">Member Portal</Text>
          </View>

          {/* Form */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-bold text-slate-900 mb-1">Welcome back</Text>
            <Text className="text-slate-500 mb-8">Sign in to your account</Text>

            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              placeholder="••••••••"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mt-2"
            />

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-primary-800 font-semibold">Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
