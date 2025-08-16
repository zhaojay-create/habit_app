import {
  client,
  databases,
  DATABASES_ID,
  HABIT_COLLECTION_ID,
  HABIT_COMPLETIONS_COLLECTION_ID,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const [habits, setHabits] = useState<Habit[]>([]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASES_ID,
        HABIT_COLLECTION_ID,
        [Query.equal("user_id", user?.$id || "")]
      );
      setHabits(response.documents as unknown as Habit[]);
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASES_ID, HABIT_COLLECTION_ID, id);
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleComplete = async (id: string) => {
    if (!user) return;
    try {
      const currentDate = new Date().toISOString();
      // 记录 习惯 完成
      await databases.updateDocument(
        DATABASES_ID,
        HABIT_COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          complete_at: currentDate,
        }
      );
      // 更新习惯
      const habit = habits.find((habit) => habit.$id === id);
      if (habit) {
        await databases.updateDocument(DATABASES_ID, HABIT_COLLECTION_ID, id, {
          last_completed: currentDate,
          streak_count: habit.streak_count + 1,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchHabits();
    // 当添加习惯后，没有重新获取的解决:
    const chanel = `databases.${DATABASES_ID}.collections.${HABIT_COLLECTION_ID}.documents`;
    const habitsListener = client.subscribe(chanel, (paload) => {
      if (
        paload.events.includes(
          "databases.*.collections.*.documents.*.create"
        ) ||
        paload.events.includes(
          "databases.*.collections.*.documents.*.update"
        ) ||
        paload.events.includes("databases.*.collections.*.documents.*.delete")
      ) {
        fetchHabits();
      }
      return () => {
        habitsListener(); // 取消订阅
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const RenderRightActions = () => {
    return (
      <View style={style.swipeActionRight}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        />
      </View>
    );
  };

  const RenderLeftActions = () => {
    return (
      <View style={style.swipeActionLeft}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={32}
          color={"#fff"}
        />
      </View>
    );
  };

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Text variant="headlineSmall" style={style.title}>
          今日习惯
        </Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          登出
        </Button>
      </View>
      {
        <ScrollView showsVerticalScrollIndicator={false}>
          {habits.length > 0 ? (
            habits.map((habit) => (
              <Swipeable
                ref={(ref) => {
                  swipeableRefs.current[habit.$id] = ref;
                }}
                key={habit.$id}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={RenderLeftActions}
                renderRightActions={RenderRightActions}
                onSwipeableClose={(direction) => {
                  if (direction === "left") {
                    handleDelete(habit.$id);
                  } else if (direction === "right") {
                    handleComplete(habit.$id);
                  }
                  swipeableRefs.current[habit.$id]?.close(); // 关闭 Swipeable
                }}
              >
                <Surface style={style.card} elevation={0}>
                  <View key={habit.$id} style={style.cardContent}>
                    <Text style={style.cardTitle}>{habit.title}</Text>
                    <Text style={style.cardDescription}>
                      {habit.description}
                    </Text>
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
              </Swipeable>
            ))
          ) : (
            <View style={style.emptyContainer}>
              <Text style={style.emptyTitle}>还没有习惯, 开始创建习惯吧</Text>
            </View>
          )}
        </ScrollView>
      }
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    color: "#666666",
    fontWeight: "bold",
    marginBottom: 16,
  },
  swipeActionLeft: {
    flex: 1,
    backgroundColor: "#e53953",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 18,
    borderRadius: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    flex: 1,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 18,
    borderRadius: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
