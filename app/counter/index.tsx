import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Notifications from "expo-notifications";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import { useEffect, useState } from "react";
import { Duration, intervalToDuration, isBefore } from "date-fns";
import TimeSegment from "../../components/TimeSegment";
import { getFromStorage, saveToStorage } from "../../utils/storage";

type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
};

type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

const frequency = 1000 * 20;
const countdownStorageKey = "task-countdown";

export default function CounterScreen() {
  const [loading, setLoading] = useState(true);
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });

  const lastCompletedTimestamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);
      setCountdownState(value);
    };
    init();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = lastCompletedTimestamp
        ? lastCompletedTimestamp + frequency
        : Date.now();

      lastCompletedTimestamp && setLoading(false);
      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: Date.now() }
          : { start: Date.now(), end: timestamp },
      );
      setStatus({ isOverdue, distance });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastCompletedTimestamp]);

  const scheduleNotification = async () => {
    let notificationId;
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "The task is due! 🕷️",
        },
        trigger: {
          seconds: frequency / 1000,
        },
      });
    } else {
      Alert.alert(
        "Unable to schedule notification",
        "Enable notification permission for Expo Go in settings",
      );
    }

    if (countdownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        countdownState?.currentNotificationId,
      );
    }

    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: notificationId,
      completedAtTimestamps: countdownState
        ? [Date.now(), ...countdownState.completedAtTimestamps]
        : [Date.now()],
    };
    setCountdownState(newCountdownState);
    await saveToStorage(countdownStorageKey, newCountdownState);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, status.isOverdue ? styles.late : undefined]}
    >
      {status.isOverdue ? (
        <Text
          style={[
            styles.heading,
            status.isOverdue ? styles.whiteText : undefined,
          ]}
        >
          Task overdue by
        </Text>
      ) : (
        <Text
          style={[
            styles.heading,
            status.isOverdue ? styles.whiteText : undefined,
          ]}
        >
          Task due in...
        </Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          number={status.distance.days ?? 0}
          unit="Days"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          number={status.distance.hours ?? 0}
          unit="Hours"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          number={status.distance.minutes ?? 0}
          unit="Minutes"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          number={status.distance.seconds ?? 0}
          unit="Seconds"
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={scheduleNotification}
      >
        <Text style={styles.buttonText}>Done it!</Text>
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

  row: {
    flexDirection: "row",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },

  late: {
    backgroundColor: "red",
  },

  whiteText: {
    color: "white",
  },

  loading: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    justifyContent: "center",
    alignItems: "center",
  },
});
