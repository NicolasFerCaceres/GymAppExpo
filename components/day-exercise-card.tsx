import { DayExercise } from "@/types/dayExercise";
import { Exercise } from "@/types/exercise";
import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Button } from "./ui/Button";
import { IconSymbol } from "./ui/icon-symbol";

type Props = {
  dayExercise: DayExercise;
  exercise?: Exercise;
  onEdit: (dayExercise: DayExercise) => void;
  onDelete: (dayExercise: DayExercise) => void;
};

export function DayExerciseCard({
  dayExercise,
  exercise,
  onEdit,
  onDelete,
}: Props) {
  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.info}>
        <ThemedText style={styles.name}>
          {exercise?.exercise_name ?? `Ejercicio #${dayExercise.exercise_id}`}
        </ThemedText>
        <ThemedText style={styles.detail}>
          {dayExercise.sets} x {dayExercise.reps} · {dayExercise.weight} kg
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.actions}>
        <Button
          variant="outline"
          onPress={() => onEdit(dayExercise)}
          style={styles.btn}
          icon={<IconSymbol name="pencil" size={18} color="#185FA5" />}
        />
        <Button
          variant="destructive"
          onPress={() => onDelete(dayExercise)}
          style={styles.btn}
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
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "500" },
  detail: { fontSize: 13, color: "#888", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  btn: { paddingVertical: 7, paddingHorizontal: 14 },
});
