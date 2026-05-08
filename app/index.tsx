import { ThemedView } from "@/components/themed-view";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ThemedView style={style.container}>
      <Button label={"Entrenar"} onPress={() => router.push("/workout")} />
    </ThemedView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // también centra horizontalmente
  },
});
