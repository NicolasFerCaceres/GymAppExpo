import { ConfirmModal } from "@/components/confirm-modal";
import { ExerciseCard } from "@/components/exercise-card";
import { InputModal } from "@/components/input-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import {
  createExercise,
  deleteExercise,
  getAllExercises,
  updateExercise,
} from "@/database/repositories/exerciseRepository";
import { Exercise } from "@/types/exercise";
import { Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TextInput } from "react-native";

export default function ExercisesScreen() {
  const db = useSQLiteContext();
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    async function loadExercises() {
      try {
        const data = await getAllExercises(db);
        setExercises(data);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    loadExercises();
  }, [db, refresh]);
  const filtered = exercises.filter((ex) =>
    ex.exercise_name.toLowerCase().includes(search.toLowerCase()),
  );

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const [editModal, setEditModal] = useState(false);

  const [addModal, setAddModal] = useState(false);

  function handleAdd() {
    setAddModal(true);
  }

  function handleEdit(exercise: Exercise) {
    setSelectedExercise(exercise);
    setEditModal(true);
  }

  async function confirmAddExercise(name: string) {
    try {
      const created = await createExercise(db, name);
      console.log("creado: ", created.exercise_name);
      setAddModal(false);
      setRefresh((r) => r + 1);
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  async function confirmEditExercise(newName: string) {
    try {
      if (!selectedExercise) {
        throw new Error("El id de ejercicio no puede ser nulo");
      }
      const edited = await updateExercise(
        db,
        selectedExercise.exercise_id,
        newName,
      );

      if (edited) {
        setEditModal(false);
        setSelectedExercise(null);
        setRefresh((r) => r + 1);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  function handleDelete(exercise: Exercise) {
    setSelectedExercise(exercise);
    setDeleteModal(true);
  }

  async function confirmDeleteExercise() {
    try {
      if (!selectedExercise)
        throw new Error("El id de ejercicio no puede ser nulo");
      const deleted = await deleteExercise(db, selectedExercise.exercise_id);
      if (deleted) {
        setDeleteModal(false);
        setSelectedExercise(null);
        setRefresh((r) => r + 1);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Ejercicios" }} />
      <ThemedView style={styles.header}>
        <TextInput
          style={styles.search}
          placeholder="Buscar..."
          value={search}
          onChangeText={setSearch}
        />
        <Button label="Nuevo" variant="add" onPress={handleAdd} />
      </ThemedView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.exercise_id.toString()}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            No se encontraron ejercicios
          </ThemedText>
        }
      />
      <InputModal
        visible={addModal}
        title="Nuevo ejercicio"
        onConfirm={confirmAddExercise}
        onCancel={() => setAddModal(false)}
      />
      <InputModal
        visible={editModal}
        title="Editar ejercicio"
        initialValue={selectedExercise?.exercise_name}
        onConfirm={(newName) => confirmEditExercise(newName)}
        onCancel={() => setEditModal(false)}
      />
      <ConfirmModal
        visible={deleteModal}
        title="Delete exercise"
        message={`Estas seguro que deseas eliminar el ejercicio "${selectedExercise?.exercise_name}" `}
        onConfirm={() => confirmDeleteExercise()}
        onCancel={() => setDeleteModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
    gap: 12,
  },
  search: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
  },
});
