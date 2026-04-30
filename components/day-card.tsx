import { Day } from "@/types/day";
import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Button } from "./ui/Button";
import { IconSymbol } from "./ui/icon-symbol";

type Props = {
  day: Day;
  onOpen: (day: Day) => void;
  onEdit: (day: Day) => void;
  onDelete: (day: Day) => void;
};

export function DayCard({ day, onOpen, onEdit, onDelete }: Props) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.name}>{day.day_desc}</ThemedText>
      <ThemedView style={styles.actions}>
        <Button
          variant="outline"
          onPress={() => onOpen(day)}
          style={styles.btn}
          icon={<IconSymbol name="chevron.right" size={22} color="#185FA5" />}
        />
        <Button
          variant="outline"
          onPress={() => onEdit(day)}
          style={styles.btn}
          icon={<IconSymbol name="pencil" size={22} color="#185FA5" />}
        />
        <Button
          variant="destructive"
          onPress={() => onDelete(day)}
          style={styles.btn}
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
    padding: 4,
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
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
});
