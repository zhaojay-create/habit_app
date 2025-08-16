import { Habit } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Surface, Text } from "react-native-paper";
import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TRANSLATE_X_THRESHOLD = -SCREEN_WIDTH * 0.3;

type HabitItemProps = {
  habit: Habit;
  onDismiss: (id: string) => void;
};

export default function HabitItem({ habit, onDismiss }: HabitItemProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < TRANSLATE_X_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
          runOnJS(onDismiss)(habit.$id);
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ transform: [{ translateX: translateX }] }}>
        <Surface style={style.card} elevation={0}>
          <View style={style.cardContent}>
            <Text style={style.cardTitle}>{habit.title}</Text>
            <Text style={style.cardDescription}>{habit.description}</Text>
            <View style={style.cardFooter}>
              <View style={style.streakBadge}>
                <MaterialCommunityIcons
                  name="fire"
                  size={18}
                  color={"#ff9800"}
                />
                <Text style={style.streakText}>
                  {habit.streak_count} day streak
                </Text>
              </View>
              <View style={style.frequencyBadge}>
                <Text style={style.frequencyText}>
                  {habit.frequency.charAt(0).toLowerCase() +
                    habit.frequency.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </Surface>
      </Animated.View>
    </GestureDetector>
  );
}

const style = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: { padding: 20 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: { fontSize: 15, marginBottom: 16, color: "#6c6c80" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    marginLeft: 6,
    color: "7c4dff",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
});
