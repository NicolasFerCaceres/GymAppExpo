// components/routine-picker-modal.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Routine } from "@/types/routine";
import { FlatList, Modal, Pressable, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  routines: Routine[];
  onSelect: (id: number) => void;
  onCancel: () => void;
  title?: string;
};

export function RoutinePickerModal({
  visible,
  routines,
  onSelect,
  onCancel,
  title = "Elegir rutina",
}: Props) {
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

          <FlatList
            data={routines}
            keyExtractor={(item) => String(item.routine_id)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No tenés rutinas creadas todavía.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item.routine_id)}
                style={styles.option}
              >
                <ThemedText>{item.routine_desc}</ThemedText>
              </Pressable>
            )}
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
  modalTitle: { fontSize: 18, fontWeight: "500" },
  option: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#888",
    marginVertical: 4,
  },
  emptyText: { textAlign: "center", paddingVertical: 20, opacity: 0.6 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
});
