import { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

type Variant = "primary" | "outline" | "add" | "ghost" | "destructive";

type Props = {
  label?: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: ReactNode;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
  icon,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      <Text style={[textStyles.base, textStyles[variant], textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primary: { backgroundColor: "#185FA5" },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#185FA5",
  },
  add: {
    borderWidth: 1.8,
    height: 36,
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "#185FA5",
  },
  ghost: { backgroundColor: "transparent" },
  destructive: { backgroundColor: "#FCEBEB" },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});

const textStyles = StyleSheet.create({
  base: { fontSize: 15, fontWeight: "500" },
  primary: { color: "#fff" },
  outline: { color: "#185FA5" },
  add: { color: "#fff", fontSize: 22 },
  ghost: { color: "#888" },
  destructive: { color: "#A32D2D" },
});
