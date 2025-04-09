import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../utils/authContext";

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const router = useRouter(); // Get the
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}> </Text>
      </View>

      <Image
        style={styles.profile}
        source={{
          uri: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600",
        }}
      />

      <Text>Username: John Doe</Text>
      <TouchableOpacity
        style={styles.buttonRed}
        onPress={() => {
          logout();
          router.push("/");
        }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    height: 50,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profile: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  buttonRed: {
    backgroundColor: "red",
    padding: 10,
    marginTop: 300,
    borderRadius: 8,
  },
});
