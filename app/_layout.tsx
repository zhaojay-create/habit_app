import { AuthContextProvider, useAuth } from "@/lib/auth-context";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

function RouterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loadingUser } = useAuth();
  const segments = useSegments();

  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    // 判断是否在 auth 的页面
    const isAuthGroup = segments[0] === "auth";

    if (!user && !isAuthGroup && !loadingUser) {
      router.replace("/auth");
    } else if (user && isAuthGroup && !loadingUser) {
      router.replace("/");
    }
  }, [user, segments, router, loadingUser, rootNavigationState]);

  if (loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <RouterGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouterGuard>
    </AuthContextProvider>
  );
}
