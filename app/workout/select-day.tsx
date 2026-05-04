import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { getDaysByRoutineId } from "@/database/repositories/dayRepository";
import { getActiveRoutine } from "@/database/repositories/routineRepository";
import { Day } from "@/types/day";
import { Routine } from "@/types/routine";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet } from "react-native";

export default function SelectDayScreen() {
  const db = useSQLiteContext();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const active = await getActiveRoutine(db);
        if (!active) {
          Alert.alert(
            "Sin rutina activa",
            "Seleccioná una rutina antes de entrenar.",
          );
          router.back();
          return;
        }
        setRoutine(active);
        const allDays = await getDaysByRoutineId(db, active.routine_id);
        setDays(allDays);
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

  const handleSelect = (dayId: number) => {
    router.replace({
      pathname: "/workout",
      params: { dayId: String(dayId) },
    });
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
        ¿Qué día vas a entrenar?
      </ThemedText>
      {routine && (
        <ThemedText style={styles.muted}>
          Rutina: {routine.routine_desc}
        </ThemedText>
      )}

      {days.length === 0 ? (
        <ThemedView style={styles.empty}>
          <ThemedText style={styles.muted}>
            Esta rutina no tiene días configurados.
          </ThemedText>
          <Button
            label="Configurar rutina"
            onPress={() => {
              router.back();
              if (routine) router.push(`/routine/${routine.routine_id}`);
            }}
          />
        </ThemedView>
      ) : (
        <ThemedView style={styles.list}>
          {days.map((d) => (
            <Pressable
              key={d.day_id}
              onPress={() => handleSelect(d.day_id)}
              style={styles.item}
            >
              <ThemedText>{d.day_desc}</ThemedText>
              <ThemedText style={styles.arrow}>›</ThemedText>
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
  container: { flex: 1, padding: 20, gap: 16 },
  center: { justifyContent: "center", alignItems: "center" },
  heading: { marginBottom: 4 },
  muted: { opacity: 0.6 },
  list: { gap: 8, flex: 1 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  item: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  arrow: { opacity: 0.5, fontSize: 20 },
});
