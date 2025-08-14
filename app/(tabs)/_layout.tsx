import { Entypo } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "tomato" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "home",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="login" options={{ title: "login" }} />
    </Tabs>
  );
}
