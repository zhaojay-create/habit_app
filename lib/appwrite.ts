import { Account, Client, Databases } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform("com.cooze.habitapp");

export const account = new Account(client); // 用户
export const databases = new Databases(client); // 数据库

export const DATABASES_ID = process.env.EXPO_PUBLIC_DB_ID!; // 数据库 ID

export const HABIT_COLLECTION_ID =
  process.env.EXPO_PUBLIC_DB_HABIT_COLLECTION_ID!; // habits 表的 ID

export const HABIT_COMPLETIONS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_DB_HABIT_COMPLETIONS_COLLECTION_ID!; // habits_completions 表的id

export interface RealtimeResponse {
  event: string;
  payload: any;
}
