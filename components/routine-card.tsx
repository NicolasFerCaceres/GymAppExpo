import { Day } from "@/types/day";
import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type Props = {
  days: Day[];
  onOpen: (day: Day) => void;
  onEdit: (day: Day) => void;
  onDelete: (day: Day) => void;
};

export function RoutineCard({ day, onOpen, onEdit, onDelete }: Props) {
  return (
    <ThemedView>
      <ThemedText></ThemedText>
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
});
