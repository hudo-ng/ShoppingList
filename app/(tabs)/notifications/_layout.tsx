import { Link, Stack } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "../../../theme";
import { Pressable, View } from "react-native";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Notifications",
          headerRight: () => (
            <View>
              <Link href="/counter/history" asChild>
                <Pressable hitSlop={20}>
                  <MaterialIcons
                    name="history"
                    size={32}
                    color={theme.colorGrey}
                  />
                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
