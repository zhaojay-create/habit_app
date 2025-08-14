import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }

    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }

    let error = null;
    // 根据 isSignup 判断, 注册还是登录
    if (isSignup) {
      error = await signUp(email, password);
    } else {
      error = await signIn(email, password);
    }
    setError(error);
    if (error) {
      return;
    }
    // 登录成功
    router.replace("/");
  };

  const handleSwitchMode = () => {
    setIsSignup((pre) => !pre);
  };

  return (
    // 不会阻碍 View 的键盘遮挡
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignup ? "注册账号" : "欢迎回来"}
        </Text>
        <TextInput
          style={styles.input}
          label="邮箱"
          autoCapitalize="none" // 不自动大写
          keyboardType="email-address" // 键盘类型
          placeholder="example@gmail.com"
          mode="outlined"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          label="密码"
          autoCapitalize="none" // 不自动大写
          mode="outlined"
          secureTextEntry
          onChangeText={setPassword}
        />
        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
        <Button mode="contained" style={styles.button} onPress={handleAuth}>
          {isSignup ? "注册" : "登录"}
        </Button>
        <Button
          mode="text"
          style={styles.switchMode}
          onPress={handleSwitchMode}
        >
          {isSignup ? "我已经有账号了,登录" : "我还没有账号,注册一个吧"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  switchMode: {
    marginTop: 16,
  },
});

export default AuthScreen;
