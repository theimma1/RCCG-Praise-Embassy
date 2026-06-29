import React from "react";
import { useAuthStore } from "@/store/authStore";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}
