import { Stack } from "expo-router";
import { AuthContextProvider } from "../utils/authContext";

export default function LayOut() {
  return (
    <AuthContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Log In" }}
        />
      </Stack>
    </AuthContextProvider>
  );
}
