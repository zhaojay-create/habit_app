import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  loadingUser: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};

export const AuthContextProvider = function ({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loadingUser, setLoadingUser] = useState(false);

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const user = await account.get();
      setUser(user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 登录
  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "signIn error";
    }
  };
  // 注册
  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await signIn(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "signUp error";
    }
  };
  // 注销
  const signOut = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loadingUser, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
