import { ConfirmModal } from "@/components/confirm-modal";
import { InputModal } from "@/components/input-modal";
import { RoutineListCard } from "@/components/routine-list-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import {
  createRoutine,
  deleteRoutine,
  getAllRoutines,
  updateRoutine,
} from "@/database/repositories.ts/routineRepository";
import { Routine } from "@/types/routine";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TextInput } from "react-native";

export default function RoutineListScreen() {
  const db = useSQLiteContext();
  const [search, setSearch] = useState("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [refresh, setRefresh] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function loadRoutines() {
      try {
        const data = await getAllRoutines(db);
        setRoutines(data);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    loadRoutines();
  }, [db, refresh]);
  const filtered = routines.filter((ro) =>
    ro.routine_desc.toLowerCase().includes(search.toLocaleLowerCase()),
  );
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  function handleAdd() {
    setAddModal(true);
  }
  function handleEdit(routine: Routine) {
    setSelectedRoutine(routine);
    setEditModal(true);
  }

  function handleDelete(routine: Routine) {
    setSelectedRoutine(routine);
    setDeleteModal(true);
  }

  async function confirmAddRoutine(desc: string) {
    try {
      const created = await createRoutine(db, desc);
      console.log("Creado: ", created.routine_id);
      setAddModal(false);
      setRefresh((r) => r + 1);
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }
  async function confirmEditRoutine(newDesc: string) {
    try {
      if (!selectedRoutine) {
        throw new Error("El id de la rutina no puede ser nulo");
      }
      const edited = await updateRoutine(
        db,
        selectedRoutine.routine_id,
        newDesc,
      );
      if (edited) {
        setEditModal(false);
        setSelectedRoutine(null);
        setRefresh((r) => r + 1);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  async function confirmDeleteRoutine() {
    try {
      if (!selectedRoutine) {
        throw new Error("El id de ejercicio no puede ser nulo");
      }
      const deleted = await deleteRoutine(db, selectedRoutine.routine_id);
      if (deleted) {
        setDeleteModal(false);
        setSelectedRoutine(null);
        setRefresh((r) => r + 1);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Rutinas</ThemedText>
        <TextInput
          style={styles.search}
          placeholder="Buscar.."
          value={search}
          onChangeText={setSearch}
        />
        <Button label="Nuevo" variant="add" onPress={handleAdd} />
      </ThemedView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.routine_id.toString()}
        renderItem={({ item }) => (
          <RoutineListCard
            routine={item}
            onOpen={(r) => router.push(`/routine/${r.routine_id}`)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <ThemedText style={styles.empty}>
            No se encontraron rutinas
          </ThemedText>
        }
      />
      <InputModal
        visible={addModal}
        title="Crear Rutina"
        onConfirm={confirmAddRoutine}
        onCancel={() => setAddModal(false)}
      />
      <InputModal
        visible={editModal}
        title="Editar Rutina"
        initialValue={selectedRoutine?.routine_desc}
        onConfirm={(newName) => confirmEditRoutine(newName)}
        onCancel={() => setEditModal(false)}
      />
      <ConfirmModal
        visible={deleteModal}
        title="Borrar Rutina"
        message={`Estas seguro que deseas eliminar la rutina "${selectedRoutine?.routine_desc}"`}
        onConfirm={() => confirmDeleteRoutine()}
        onCancel={() => setDeleteModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    paddingTop: 56,
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
