import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Exercise } from "@/types/exercise";
import { StyleSheet } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

type Props = {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
};

export function ExerciseCard({ exercise, onEdit, onDelete }: Props) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.name}>{exercise.exercise_name}</ThemedText>
      <ThemedView style={styles.actions}>
        <Button
          label=""
          variant="outline"
          onPress={() => onEdit(exercise)}
          style={styles.btnEdit}
          icon={<IconSymbol name="pencil" size={22} color="#185FA5" />}
        />
        <Button
          label=""
          variant="destructive"
          onPress={() => onDelete(exercise)}
          style={styles.btnDelete}
          icon={<IconSymbol name="trash" size={22} color="#A32D2D" />}
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
