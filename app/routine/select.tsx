import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import {
  getAllRoutines,
  setActiveRoutine,
} from "@/database/repositories/routineRepository";
import { Routine } from "@/types/routine";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function SelectRoutineScreen() {
  const db = useSQLiteContext();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getAllRoutines(db);
        setRoutines(all);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Error desconocido",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db]);

  const handleSelect = async (id: number) => {
    try {
      await setActiveRoutine(db, id);
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Error desconocido",
      );
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        Seleccioná tu rutina activa
      </ThemedText>

      {routines.length === 0 ? (
        <ThemedView style={styles.empty}>
          <ThemedText style={styles.muted}>
            Todavía no tenés rutinas creadas.
          </ThemedText>
          <Button
            label="Crear rutina"
            onPress={() => {
              router.back();
              router.push("/routine");
            }}
          />
        </ThemedView>
      ) : (
        <ThemedView style={styles.list}>
          {routines.map((r) => (
            <Pressable
              key={r.routine_id}
              onPress={() => handleSelect(r.routine_id)}
              style={[styles.item, r.is_active === 1 && styles.itemActive]}
            >
              <ThemedText>{r.routine_desc}</ThemedText>
              {r.is_active === 1 && (
                <ThemedText style={styles.check}>✓</ThemedText>
              )}
            </Pressable>
          ))}
        </ThemedView>
      )}

      <Button
        label="Cancelar"
        onPress={() => router.back()}
        variant="outline"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  center: { justifyContent: "center", alignItems: "center" },
  heading: { marginBottom: 8 },
  list: { gap: 8, flex: 1 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  muted: { opacity: 0.6, textAlign: "center" },
  item: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemActive: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  check: { color: "#3b82f6", fontWeight: "700" },
});
