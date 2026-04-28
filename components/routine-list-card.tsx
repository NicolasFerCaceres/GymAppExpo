import { Routine } from "@/types/routine";
import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Button } from "./ui/Button";
import { IconSymbol } from "./ui/icon-symbol";

type Props = {
  routine: Routine;
  onOpen: (routine: Routine) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
};

export function RoutineListCard({ routine, onOpen, onEdit, onDelete }: Props) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.name}>{routine.routine_desc}</ThemedText>
      <ThemedView style={styles.actions}>
        <Button
          label=""
          variant="outline"
          onPress={() => onOpen(routine)}
          style={styles.btnEdit}
          icon={<IconSymbol name="chevron.right" size={18} color="#185FA5" />}
        />
        <Button
          label=""
          variant="outline"
          onPress={() => onEdit(routine)}
          style={styles.btnEdit}
          icon={<IconSymbol name="pencil" size={18} color="#185FA5" />}
        />
        <Button
          label=""
          variant="destructive"
          onPress={() => onDelete(routine)}
          style={styles.btnDelete}
          icon={<IconSymbol name="trash" size={18} color="#A32D2D" />}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  btnEdit: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  btnDelete: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
});
