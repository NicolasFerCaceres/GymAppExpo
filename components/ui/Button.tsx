import { Pressable } from "react-native";
import { ThemedText } from "../themed-text";

type ButtonProps = {
  label: string;
  onPress: () => void;
};

export default function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}
