import { useAuth } from "@/lib/auth-context";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  const { signOut } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button mode="text" onPress={signOut}>
        登出
      </Button>
    </View>
  );
}

const style = StyleSheet.create({
  link: {
    marginTop: 15,
    color: "blue",
    paddingVertical: 15,
  },
});
