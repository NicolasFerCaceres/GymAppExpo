import Menu, { MenuItem } from "@/components/menu";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function RoutineScreen() {
  const router = useRouter();
  const ROUTINE_MENU: MenuItem[] = [
    {
      desc: "Ejercicios",
      onPress: () => router.push("/routine/exercises"),
    },
    {
      desc: "Rutina",
      onPress: () => router.push("/routine"),
    },
  ];
  return (
    <ThemedView style={styles.container}>
      <Menu items={ROUTINE_MENU} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
