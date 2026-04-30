// components/ExercisePickerModal.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Exercise } from "@/types/exercise";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";

type Props = {
  visible: boolean;
  exercises: Exercise[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCancel: () => void;
  title?: string;
};

export function ExercisePickerModal({
  visible,
  exercises,
  selectedId,
  onSelect,
  onCancel,
  title = "Elegir ejercicio",
}: Props) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) setSearch("");
  }, [visible]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => e.exercise_name.toLowerCase().includes(q));
  }, [exercises, search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modalBox}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar..."
            autoFocus
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.exercise_id)}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No se encontraron ejercicios.
              </ThemedText>
            }
            renderItem={({ item }) => {
              const selected = item.exercise_id === selectedId;

              console.log(
                item.exercise_name,
                "selected?",
                selected,
                "selectedId:",
                selectedId,
              );

              return (
                <Pressable
                  onPress={() => onSelect(item.exercise_id)}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <ThemedText
                    style={selected ? styles.optionTextSelected : undefined}
                  >
                    {item.exercise_name}
                  </ThemedText>
                </Pressable>
              );
            }}
          />

          <ThemedView style={styles.modalActions}>
            <Button label="Cancelar" variant="ghost" onPress={onCancel} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#000",
  },
  list: {
    flexGrow: 0,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginVertical: 4,
  },
  optionSelected: {
    backgroundColor: "#185FA5",
    borderColor: "#185FA5",
  },
  optionTextSelected: { color: "#fff" },
  emptyText: {
    textAlign: "center",
    paddingVertical: 20,
    color: "#888",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
});
