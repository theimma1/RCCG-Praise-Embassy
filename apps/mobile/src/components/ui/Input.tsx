import React, { forwardRef } from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, ...rest }, ref) => {
    return (
      <View className="w-full mb-4">
        {label && (
          <Text className="text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`bg-white border ${error ? "border-red-500" : "border-slate-200"} rounded-xl px-4 py-3.5 text-base text-slate-900 ${className ?? ""}`}
          placeholderTextColor="#94a3b8"
          {...rest}
        />
        {error && (
          <Text className="text-xs text-red-500 mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
export default Input;
