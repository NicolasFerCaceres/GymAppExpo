import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { getDayExercisesWithDetails } from "@/database/repositories/dayExerciseRepository";
import { getDayById } from "@/database/repositories/dayRepository";
import { getRoutineById } from "@/database/repositories/routineRepository";
import { Day } from "@/types/day";
import { DayExerciseDetail } from "@/types/dayExercise";
import { Routine } from "@/types/routine";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

type SetEntry = {
  set_number: number;
  reps: string;
  weight: string;
  done: boolean;
};

type ExerciseSets = {
  [day_ex_id: number]: SetEntry[];
};

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const id = Number(dayId);

  const [day, setDay] = useState<Day | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<DayExerciseDetail[]>([]);
  const [sets, setSets] = useState<ExerciseSets>({});
  const [loading, setLoading] = useState(true);

  const [restSeconds, setRestSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;

    const load = async () => {
      try {
        const dayData = await getDayById(db, id);
        const routineData = await getRoutineById(db, dayData.routine_id);
        const exerciseList = await getDayExercisesWithDetails(db, id);

        const initialSets: ExerciseSets = {};
        exerciseList.forEach((ex) => {
          initialSets[ex.day_ex_id] = Array.from(
            { length: ex.sets },
            (_, i) => ({
              set_number: i + 1,
              reps: String(ex.reps),
              weight: String(ex.weight),
              done: false,
            }),
          );
        });

        setDay(dayData);
        setRoutine(routineData);
        setExercises(exerciseList);
        setSets(initialSets);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Error desconocido",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db, id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!id || isNaN(id)) {
    return <Redirect href="/" />;
  }

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const updateSetField = (
    dayExId: number,
    setIndex: number,
    field: "reps" | "weight",
    value: string,
  ) => {
    setSets((prev) => ({
      ...prev,
      [dayExId]: prev[dayExId].map((s, i) =>
        i === setIndex ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const toggleSetDone = (dayExId: number, setIndex: number) => {
    const currentSet = sets[dayExId][setIndex];
    const newDone = !currentSet.done;

    setSets((prev) => ({
      ...prev,
      [dayExId]: prev[dayExId].map((s, i) =>
        i === setIndex ? { ...s, done: newDone } : s,
      ),
    }));

    if (newDone) {
      startRestTimer(90);
    }
  };

  const startRestTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestSeconds(seconds);
    timerRef.current = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stopRestTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestSeconds(0);
  };

  const handleFinish = () => {
    const totalSets = Object.values(sets).flat().length;
    const doneSets = Object.values(sets)
      .flat()
      .filter((s) => s.done).length;

    Alert.alert(
      "Finalizar entreno",
      `Completaste ${doneSets} de ${totalSets} series. ¿Finalizar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          onPress: () => {
            // TODO: guardar workout en DB
            router.replace("/");
          },
        },
      ],
    );
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">{day?.day_desc}</ThemedText>
          <ThemedText style={styles.muted}>{routine?.routine_desc}</ThemedText>
        </ThemedView>

        {exercises.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText style={styles.muted}>
              Este día no tiene ejercicios configurados.
            </ThemedText>
          </ThemedView>
        ) : (
          exercises.map((ex) => (
            <ThemedView key={ex.day_ex_id} style={styles.exerciseCard}>
              <ThemedView style={styles.exerciseHeader}>
                <ThemedText style={styles.exerciseName}>
                  {ex.exercise_name}
                </ThemedText>
                <ThemedText style={styles.muted}>
                  {ex.sets}x{ex.reps} · objetivo {ex.weight}kg
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.setsHeader}>
                <ThemedText style={styles.colNum}>#</ThemedText>
                <ThemedText style={styles.colInput}>Reps</ThemedText>
                <ThemedText style={styles.colInput}>Peso</ThemedText>
                <ThemedText style={styles.colCheck}>✓</ThemedText>
              </ThemedView>

              {sets[ex.day_ex_id]?.map((s, idx) => (
                <ThemedView
                  key={s.set_number}
                  style={[styles.setRow, s.done && styles.setRowDone]}
                >
                  <ThemedText style={styles.colNum}>{s.set_number}</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={s.reps}
                    onChangeText={(v) =>
                      updateSetField(ex.day_ex_id, idx, "reps", v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                  />
                  <TextInput
                    style={styles.input}
                    value={s.weight}
                    onChangeText={(v) =>
                      updateSetField(ex.day_ex_id, idx, "weight", v)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#6b7280"
                  />
                  <Pressable
                    onPress={() => toggleSetDone(ex.day_ex_id, idx)}
                    style={[styles.check, s.done && styles.checkDone]}
                  >
                    {s.done && (
                      <ThemedText style={styles.checkText}>✓</ThemedText>
                    )}
                  </Pressable>
                </ThemedView>
              ))}
            </ThemedView>
          ))
        )}
      </ScrollView>

      <ThemedView style={styles.footer}>
        <Button label="Finalizar entreno" onPress={handleFinish} />
      </ThemedView>

      {/* Overlay del timer de descanso - va al final para quedar arriba de todo */}
      {restSeconds > 0 && (
        <View style={styles.timerOverlay}>
          <ThemedText style={styles.timerLabel}>Descansando</ThemedText>
          <ThemedText style={styles.timerBig}>
            {formatTime(restSeconds)}
          </ThemedText>

          <View style={styles.timerControls}>
            <Pressable
              onPress={() => setRestSeconds((s) => Math.max(0, s - 30))}
              style={styles.timerCtrlBtn}
            >
              <ThemedText style={styles.timerCtrlText}>-30s</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setRestSeconds((s) => s + 30)}
              style={styles.timerCtrlBtn}
            >
              <ThemedText style={styles.timerCtrlText}>+30s</ThemedText>
            </Pressable>
          </View>

          <Pressable onPress={stopRestTimer} style={styles.timerSkip}>
            <ThemedText style={styles.timerSkipText}>
              Saltar descanso
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  scroll: { padding: 20, gap: 16, paddingBottom: 120 },
  header: { gap: 4, marginTop: 10, marginBottom: 8 },
  muted: { opacity: 0.6 },
  empty: { padding: 40, alignItems: "center" },
  exerciseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 8,
  },
  exerciseHeader: { gap: 2, marginBottom: 8 },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  setsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 4,
    opacity: 0.5,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  setRowDone: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 8,
  },
  colNum: { width: 24, textAlign: "center" },
  colInput: { flex: 1, textAlign: "center" },
  colCheck: { width: 36, textAlign: "center" },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    color: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 15,
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  checkDone: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  checkText: { color: "white", fontWeight: "700" },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  timerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    padding: 24,
  },
  timerLabel: {
    color: "white",
    fontSize: 18,
    opacity: 0.85,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  timerBig: {
    color: "white",
    fontSize: 120,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    lineHeight: 130,
  },
  timerControls: { flexDirection: "row", gap: 16 },
  timerCtrlBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "white",
    borderRadius: 999, // pill
    minWidth: 100,
    alignItems: "center",
  },
  timerCtrlText: {
    color: "#3b82f6",
    fontSize: 18,
    fontWeight: "700",
  },
  timerSkip: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  timerSkipText: {
    color: "white",
    fontSize: 16,
    opacity: 0.9,
    textDecorationLine: "underline",
  },
});
