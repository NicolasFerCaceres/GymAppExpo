import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import {
    getDayExercise,
    updateDayExercise,
} from "@/database/repositories/dayExerciseRepository";
import { getExerciseById } from "@/database/repositories/exerciseRepository";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput } from "react-native";

export default function EditDayExerciseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { dayExId } = useLocalSearchParams<{ dayExId: string }>();

  const [exerciseName, setExerciseName] = useState<string>("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const dayEx = await getDayExercise(db, Number(dayExId));
        const exercise = await getExerciseById(db, dayEx.exercise_id);

        setExerciseName(exercise.exercise_name);
        setSets(String(dayEx.sets));
        setReps(String(dayEx.reps));
        setWeight(String(dayEx.weight));
        setLoaded(true);
      } catch (error) {
        if (error instanceof Error) console.log(error.message);
      }
    }
    load();
  }, [db, dayExId]);

  async function handleSave() {
    try {
      const updated = await updateDayExercise(
        db,
        Number(dayExId),
        Number(sets),
        Number(reps),
        Number(weight),
      );
      if (updated) router.back();
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  if (!loaded) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Editar ejercicio" }} />
        <ThemedText>Cargando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Editar ejercicio" }} />

      <ThemedText style={styles.label}>Ejercicio</ThemedText>
      <ThemedView style={styles.readOnlyBox}>
        <ThemedText style={styles.readOnlyText}>{exerciseName}</ThemedText>
      </ThemedView>

      <ThemedText style={styles.label}>Series</ThemedText>
      <TextInput
        style={styles.input}
        value={sets}
        onChangeText={setSets}
        keyboardType="numeric"
      />

      <ThemedText style={styles.label}>Repeticiones</ThemedText>
      <TextInput
        style={styles.input}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
      />

      <ThemedText style={styles.label}>Peso (kg)</ThemedText>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <Button label="Guardar cambios" variant="primary" onPress={handleSave} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  label: { fontSize: 14, fontWeight: "500", marginTop: 8 },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  readOnlyBox: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 10,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#666",
  },
});
