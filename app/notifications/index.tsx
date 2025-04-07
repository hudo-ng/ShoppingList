import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import { Duration, intervalToDuration, isBefore } from "date-fns";

import { theme } from "../../theme";
import TimeSegment from "../../components/TimeSegment";
import ConfettiCannon from "react-native-confetti-cannon";
import { getFromStorage, saveToStorage } from "../../utils/storage";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
  taskName?: string;
};

type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

const frequency = 1000 * 60 * 60 * 24;
export const countdownStorageKey = "task-countdown";

export default function CounterScreen() {
  const confettiRef = useRef<any>();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState("");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });

  const lastCompletedTimestamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);
      setCountdownState(value);
    };
    init();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextTimestamp = lastCompletedTimestamp
        ? lastCompletedTimestamp + frequency
        : Date.now();

      lastCompletedTimestamp && setLoading(false);
      const isOverdue = isBefore(nextTimestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: nextTimestamp, end: Date.now() }
          : { start: Date.now(), end: nextTimestamp },
      );
      setStatus({ isOverdue, distance });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastCompletedTimestamp]);

  const handleCompletion = async () => {
    confettiRef?.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let notificationId: string | undefined;
    const result = await registerForPushNotificationsAsync();

    if (result === "granted") {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Great job! 🕷️",
          body: "Your reminder is up!",
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
        countdownState.currentNotificationId,
      );
    }

    const newState: PersistedCountdownState = {
      currentNotificationId: notificationId,
      completedAtTimestamps: [
        Date.now(),
        ...(countdownState?.completedAtTimestamps ?? []),
      ],
      taskName: task || countdownState?.taskName,
    };

    setCountdownState(newState);
    await saveToStorage(countdownStorageKey, newState);
    setTask("");
  };

  const handleSetReminder = async () => {
    if (!task.trim()) {
      Alert.alert("Task missing", "Please enter a task first.");
      return;
    }

    const permission = await registerForPushNotificationsAsync();
    if (permission !== "granted") {
      Alert.alert("Permission denied", "Please allow notifications.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Reminder",
        body: task,
        sound: "default",
      },
      trigger: reminderTime,
    });

    Alert.alert("Reminder Set", `You’ll be reminded to: ${task}`);

    const updatedCountdownState: PersistedCountdownState = {
      ...countdownState,
      taskName: task, // ✅ overwrite old task name with current input
    };

    setCountdownState(updatedCountdownState);
    await saveToStorage(countdownStorageKey, updatedCountdownState);

    setTask("");
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, status.isOverdue && styles.late]}>
      <Text style={[styles.heading, status.isOverdue && styles.whiteText]}>
        {countdownState?.taskName
          ? `${countdownState.taskName} ${status.isOverdue ? "overdue by" : "due in..."}`
          : status.isOverdue
            ? "Task overdue by"
            : "Task due in..."}
      </Text>

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

      <View style={styles.reminderBox}>
        <Text
          style={[
            styles.label,
            status.isOverdue ? styles.whiteText : undefined,
          ]}
        >
          Thing to do:
        </Text>
        <TextInput
          placeholder="Enter a task..."
          value={task}
          onChangeText={setTask}
          style={[
            styles.input,
            status.isOverdue ? styles.whiteText : undefined,
          ]}
        />
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerText}>
            Pick time: {reminderTime.toLocaleString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || reminderTime;
              setShowDatePicker(false);
              setReminderTime(currentDate);
            }}
          />
        )}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleSetReminder}
        >
          <Text style={styles.buttonText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={handleCompletion}
      >
        <Text style={styles.buttonText}>Done it!</Text>
      </TouchableOpacity>

      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -10 }}
        fadeOut
        autoStart={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginBottom: 30,
  },
  late: {
    backgroundColor: "red",
  },
  whiteText: {
    color: "white",
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    width: "100%",
  },
  buttonText: {
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  reminderBox: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 24,
  },
  datePickerButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  datePickerText: {
    color: "#fff",
    textAlign: "center",
  },
});
