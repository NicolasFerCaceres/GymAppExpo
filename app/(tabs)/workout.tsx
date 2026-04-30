// app/workout/index.tsx
import { RoutinePickerModal } from "@/components/routine-picker-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { getAllRoutines } from "@/database/repositories.ts/routineRepository";
import { getAllWorkouts } from "@/database/repositories.ts/workoutRepository";
import { Routine } from "@/types/routine";
import { Workout } from "@/types/workout";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";

export default function WorkoutIndexScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const [wData, rData] = await Promise.all([
            getAllWorkouts(db),
            getAllRoutines(db),
          ]);
          setWorkouts(wData);
          setRoutines(rData);
        } catch (error) {
          if (error instanceof Error) console.log(error.message);
        }
      }
      load();
    }, [db]),
  );

  function getRoutineDesc(routineId: number) {
    return (
      routines.find((r) => r.routine_id === routineId)?.routine_desc ??
      "Rutina eliminada"
    );
  }

  function handleStartWorkout() {
    if (routines.length === 0) {
      console.log("No hay rutinas para entrenar");
      return;
    }
    setPickerVisible(true);
  }

  function handleSelectRoutine(routineId: number) {
    setPickerVisible(false);
    router.push(`/workout/new?routineId=${routineId}`);
  }

  function handleOpenWorkout(workoutId: number) {
    router.push(`/workout/${workoutId}`);
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Entrenamientos" }} />

      <ThemedView style={styles.header}>
        <Button
          label="Empezar entrenamiento"
          variant="primary"
          onPress={handleStartWorkout}
        />
      </ThemedView>

      <ThemedText style={styles.sectionTitle}>Historial</ThemedText>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.workout_id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handleOpenWorkout(item.workout_id)}
          >
            <ThemedText style={styles.cardDate}>
              {formatDate(item.date)}
            </ThemedText>
            <ThemedText style={styles.cardRoutine}>
              {getRoutineDesc(item.routine_id)}
            </ThemedText>
          </Pressable>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            Aún no registraste ningún entrenamiento
          </ThemedText>
        }
      />

      <RoutinePickerModal
        visible={pickerVisible}
        routines={routines}
        onSelect={handleSelectRoutine}
        onCancel={() => setPickerVisible(false)}
      />
    </ThemedView>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-UY", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  listContent: { padding: 16, gap: 8 },
  card: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#888",
  },
  cardDate: { fontSize: 14, fontWeight: "500" },
  cardRoutine: { fontSize: 13, marginTop: 2, opacity: 0.7 },
  empty: { textAlign: "center", marginTop: 40, opacity: 0.6 },
});
