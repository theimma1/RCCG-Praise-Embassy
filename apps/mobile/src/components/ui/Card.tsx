import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  padded?: boolean;
}

export default function Card({ padded = true, className, children, ...rest }: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padded ? "p-4" : ""} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </View>
  );
}
