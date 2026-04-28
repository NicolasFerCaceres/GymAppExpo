import { useRouter } from "expo-router";
import { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "./themed-view";
import { Button } from "./ui/Button";

export type MenuItem = {
  desc: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: "primary" | "outline" | "add" | "ghost" | "destructive";
};

type MenuProps = {
  items: MenuItem[];
};

export default function Menu({ items }: MenuProps) {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {items.map((item) => (
        <Button
          key={item.desc}
          label={item.desc}
          onPress={item.onPress}
          variant={item.variant ?? "outline"}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
  },
});
