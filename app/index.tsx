import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { getActiveRoutine } from "@/database/repositories/routineRepository";
import { Routine } from "@/types/routine";
import { router, useFocusEffect, type Href } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Alert, StyleSheet } from "react-native";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [activeRoutine, setActiveRoutineState] = useState<Routine | null>(null);
  const push = (dir: Href) => router.push(dir);
  const pressed = () => console.log("p");

  useFocusEffect(
    useCallback(() => {
      getActiveRoutine(db)
        .then(setActiveRoutineState)
        .catch((error) => {
          Alert.alert(
            "Error",
            error instanceof Error ? error.message : "Error desconocido",
          );
        });
    }, [db]),
  );

  return (
    <ThemedView style={styles.main}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Hola 👋</ThemedText>
        <ThemedText type="subtitle">Listo para entrenar?</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedView style={styles.row}>
          <ThemedText style={styles.label}>Rutina activa</ThemedText>
          <Button
            label="Cambiar"
            onPress={() => push("/routine/select")}
            variant="outline"
          />
        </ThemedView>
        <ThemedText>
          {activeRoutine?.routine_desc ?? "Sin rutina seleccionada"}
        </ThemedText>
      </ThemedView>

      <Button
        label="Entrenar"
        onPress={() => {
          if (!activeRoutine) {
            Alert.alert(
              "Sin rutina activa",
              "Primero seleccioná una rutina activa para empezar a entrenar.",
            );
            return;
          }
          push("/workout/select-day");
        }}
      />

      <ThemedView style={styles.grid}>
        <ThemedView style={styles.gridItem}>
          <Button
            label="Rutina"
            onPress={() => push("/routine")}
            variant="outline"
          />
        </ThemedView>
        <ThemedView style={styles.gridItem}>
          <Button
            label="Ejercicios"
            onPress={() => push("/routine/exercises")}
            variant="outline"
          />
        </ThemedView>
        <ThemedView style={styles.gridItem}>
          <Button label="Comidas" onPress={pressed} variant="outline" />
        </ThemedView>
        <ThemedView style={[styles.gridItem, styles.fullWidth]}>
          <Button label="Mi actividad" onPress={pressed} variant="outline" />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, padding: 20, gap: 20 },
  header: { marginTop: 20, gap: 4 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontWeight: "600" },
  muted: { opacity: 0.6, fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { flexBasis: "48%", flexGrow: 1 },
  fullWidth: { flexBasis: "100%" },
});
