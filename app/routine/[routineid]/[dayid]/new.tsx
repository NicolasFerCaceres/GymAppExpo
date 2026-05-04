import { ExercisePickerModal } from "@/components/exercise-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { createDayExercise } from "@/database/repositories/dayExerciseRepository";
import { getAllExercises } from "@/database/repositories/exerciseRepository";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Exercise } from "@/types/exercise";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

export default function NewDayExerciseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const textColor = useThemeColor({}, "text");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllExercises(db);
        setExercises(data);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    load();
  }, [db]);

  const selectedExercise = useMemo(
    () => exercises.find((e) => e.exercise_id === exerciseId),
    [exercises, exerciseId],
  );

  async function handleSave() {
    try {
      if (!exerciseId) throw new Error("Seleccioná un ejercicio.");
      await createDayExercise(
        db,
        Number(dayId),
        exerciseId,
        Number(sets),
        Number(reps),
        Number(weight),
      );
      router.back();
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Nuevo ejercicio" }} />

      <ThemedText style={styles.label}>Ejercicio</ThemedText>
      <Pressable style={styles.selector} onPress={() => setPickerVisible(true)}>
        <ThemedText
          style={!selectedExercise ? styles.placeholderText : undefined}
        >
          {selectedExercise
            ? selectedExercise.exercise_name
            : "Seleccionar ejercicio"}
        </ThemedText>
      </Pressable>

      <ThemedText style={styles.label}>Series</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
        placeholder="Ej: 4"
        placeholderTextColor="#888"
      />

      <ThemedText style={styles.label}>Repeticiones</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        placeholder="Ej: 12"
        placeholderTextColor="#888"
      />

      <ThemedText style={styles.label}>Peso (kg)</ThemedText>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholder="Ej: 50"
        placeholderTextColor="#888"
      />

      <Button label="Guardar" variant="primary" onPress={handleSave} />

      <ExercisePickerModal
        visible={pickerVisible}
        exercises={exercises}
        selectedId={exerciseId}
        onSelect={(id) => {
          setExerciseId(id);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  selector: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#888",
  },
  placeholderText: { color: "#888" },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
});
