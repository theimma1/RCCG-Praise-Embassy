import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center ${fullScreen ? "flex-1 bg-slate-50" : "py-8"}`}>
      <ActivityIndicator size="large" color="#1a237e" />
      {message && <Text className="mt-3 text-slate-500 text-sm">{message}</Text>}
    </View>
  );
}
