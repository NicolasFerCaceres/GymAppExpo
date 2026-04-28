import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Modal, StyleSheet, TextInput } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
};

export function InputModal({
  visible,
  title,
  initialValue = "",
  onConfirm,
  onCancel,
  confirmLabel = "Save",
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue ?? "");
    }
  }, [visible, initialValue]);

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
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          <ThemedView style={styles.modalActions}>
            <Button label="Cancerlar" variant="ghost" onPress={onCancel} />
            <Button label={confirmLabel} onPress={() => onConfirm(value)} />
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
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
});
