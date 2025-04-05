import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import { useEffect, useState } from "react";

export default function CounterScreen() {
  const [repeat, setRepeat] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRepeat((pre) => pre + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const scheduleNotification = async () => {
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "I am a notification from your app 🕷️",
        },
        trigger: {
          seconds: 7,
        },
      });
    } else {
      Alert.alert(
        "Unable to schedule notification",
        "Enable notification permission for Expo Go in settings",
      );
    }
  };
  return (
    <View style={styles.container}>
      <View>
        <Text>{repeat}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={scheduleNotification}
      >
        <Text style={styles.buttonText}>Schedule a notification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },

  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
