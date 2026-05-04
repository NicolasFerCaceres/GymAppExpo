import { ConfirmModal } from "@/components/confirm-modal";
import { DayExerciseCard } from "@/components/day-exercise-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import {
    deleteDayExercise,
    getExerciseByDay,
} from "@/database/repositories/dayExerciseRepository";
import { getDayById } from "@/database/repositories/dayRepository";
import { getAllExercises } from "@/database/repositories/exerciseRepository";
import { Day } from "@/types/day";
import { DayExercise } from "@/types/dayExercise";
import { Exercise } from "@/types/exercise";
import {
    Stack,
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

export default function DayExerciseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { routineId, dayId } = useLocalSearchParams<{
    routineId: string;
    dayId: string;
  }>();

  const [day, setDay] = useState<Day | null>(null);
  const [dayExercises, setDayExercises] = useState<DayExercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [selected, setSelected] = useState<DayExercise | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const [dayData, dayExData, exData] = await Promise.all([
            getDayById(db, Number(dayId)),
            getExerciseByDay(db, Number(dayId)),
            getAllExercises(db),
          ]);
          setDay(dayData);
          setDayExercises(dayExData);
          setExercises(exData);
        } catch (error) {
          if (error instanceof Error) console.log(error.message);
        }
      }
      load();
    }, [db, dayId]),
  );

  function getExerciseFor(dayEx: DayExercise) {
    return exercises.find((e) => e.exercise_id === dayEx.exercise_id);
  }

  function handleAdd() {
    router.push(`/routine/${routineId}/${dayId}/new`);
  }

  function handleEdit(dayEx: DayExercise) {
    router.push(`/routine/${routineId}/${dayId}/${dayEx.day_ex_id}/edit`);
  }

  function handleDelete(dayEx: DayExercise) {
    setSelected(dayEx);
    setDeleteModal(true);
  }

  async function confirmDelete() {
    try {
      if (!selected) throw new Error("No hay ejercicio seleccionado.");
      const deleted = await deleteDayExercise(db, selected.day_ex_id);
      if (deleted) {
        setDayExercises((prev) =>
          prev.filter((d) => d.day_ex_id !== selected.day_ex_id),
        );
        setDeleteModal(false);
        setSelected(null);
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: day ? day.day_desc : "Día" }} />
      <ThemedView style={styles.header}>
        <Button label="Nuevo ejercicio" variant="add" onPress={handleAdd} />
      </ThemedView>

      <FlatList
        data={dayExercises}
        keyExtractor={(item) => item.day_ex_id.toString()}
        renderItem={({ item }) => (
          <DayExerciseCard
            dayExercise={item}
            exercise={getExerciseFor(item)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            Este día no tiene ejercicios aún
          </ThemedText>
        }
      />

      <ConfirmModal
        visible={deleteModal}
        title="Eliminar ejercicio"
        message="¿Estás seguro que deseas eliminar este ejercicio?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 12 },
  empty: { textAlign: "center", marginTop: 40 },
});
