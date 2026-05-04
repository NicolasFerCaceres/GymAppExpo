import { ConfirmModal } from "@/components/confirm-modal";
import { DayCard } from "@/components/day-card";
import { InputModal } from "@/components/input-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import {
    createDay,
    deleteDay,
    getDaysByRoutineId,
    updateDay,
} from "@/database/repositories/dayRepository";
import { getRoutineById } from "@/database/repositories/routineRepository";
import { Day } from "@/types/day";
import { Routine } from "@/types/routine";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

export default function RoutineScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [refresh, setRefresh] = useState(0);

  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    if (!routineId) return;

    async function loadData() {
      try {
        const id = Number(routineId);
        const routineData = await getRoutineById(db, id);
        const daysData = await getDaysByRoutineId(db, id);
        setRoutine(routineData);
        setDays(daysData);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    loadData();
  }, [db, routineId, refresh]);

  function handleAdd() {
    setAddModal(true);
  }

  function handleEdit(day: Day) {
    setSelectedDay(day);
    setEditModal(true);
  }

  function handleDelete(day: Day) {
    setSelectedDay(day);
    setDeleteModal(true);
  }

  async function confirmAddDay(name: string) {
    try {
      await createDay(db, name, Number(routineId));
      setAddModal(false);
      setRefresh((r) => r + 1);
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  async function confirmEditDay(newName: string) {
    try {
      if (!selectedDay) {
        throw new Error("El día seleccionado no puede ser nulo.");
      }
      const edited = await updateDay(
        db,
        selectedDay.day_id,
        newName,
        Number(routineId),
      );
      if (edited) {
        setEditModal(false);
        setSelectedDay(null);
        setRefresh((r) => r + 1);
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  async function confirmDeleteDay() {
    try {
      if (!selectedDay) {
        throw new Error("El día seleccionado no puede ser nulo.");
      }
      const deleted = await deleteDay(db, selectedDay.day_id);
      if (deleted) {
        setDeleteModal(false);
        setSelectedDay(null);
        setRefresh((r) => r + 1);
      }
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{ title: routine ? routine.routine_desc : "Rutina" }}
      />
      <ThemedView style={styles.header}>
        <Button label="Nuevo día" variant="add" onPress={handleAdd} />
      </ThemedView>

      <FlatList
        data={days}
        keyExtractor={(item) => item.day_id.toString()}
        renderItem={({ item }) => (
          <DayCard
            day={item}
            onOpen={(d) => router.push(`/routine/${routineId}/${d.day_id}`)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            Esta rutina no tiene días aún
          </ThemedText>
        }
      />

      <InputModal
        visible={addModal}
        title="Nuevo día"
        onConfirm={confirmAddDay}
        onCancel={() => setAddModal(false)}
      />
      <InputModal
        visible={editModal}
        title="Editar día"
        initialValue={selectedDay?.day_desc}
        onConfirm={confirmEditDay}
        onCancel={() => setEditModal(false)}
      />
      <ConfirmModal
        visible={deleteModal}
        title="Eliminar día"
        message={`¿Estás seguro que deseas eliminar el día "${selectedDay?.day_desc}"?`}
        onConfirm={confirmDeleteDay}
        onCancel={() => setDeleteModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    gap: 12,
  },
  empty: { textAlign: "center", marginTop: 40 },
});
