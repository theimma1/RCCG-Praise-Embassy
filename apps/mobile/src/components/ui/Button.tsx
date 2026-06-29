import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary-800 active:bg-primary-900",
    text: "text-white font-semibold",
  },
  secondary: {
    container: "bg-gold-500 active:bg-gold-700",
    text: "text-primary-800 font-semibold",
  },
  ghost: {
    container: "border border-primary-800 bg-transparent active:bg-primary-50",
    text: "text-primary-800 font-semibold",
  },
  danger: {
    container: "bg-red-600 active:bg-red-700",
    text: "text-white font-semibold",
  },
};

export default function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`${styles.container} ${fullWidth ? "w-full" : ""} rounded-xl px-6 py-4 items-center justify-center ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : "#1a237e"} />
      ) : (
        <Text className={`${styles.text} text-base`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
