import {
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";

const getRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#6B5CA5",
    "#F86624",
    "#05B2DC",
    "#8EA604",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

type Props = {
  name: string;
  quantity: string;
  isCompleted?: boolean;
  onDelete: () => void;
  onToggleComplete: () => void;
};
export default function ShoppingListItem({
  name,
  quantity,
  isCompleted,
  onDelete,
  onToggleComplete,
}: Props) {
  const handleDelete = () => {
    Alert.alert(
      `Are you sure you want to delete ${name}?`,
      "It will be gone for good",
      [
        {
          text: "Yes",
          onPress: () => onDelete(),
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };
  return (
    <Pressable
      style={[
        styles.itemContainer,
        isCompleted ? styles.completedContainer : undefined,
      ]}
      onPress={onToggleComplete}
    >
      <View style={styles.row}>
        <Entypo
          name={isCompleted ? "check" : "circle"}
          size={24}
          color={isCompleted ? theme.colorGreen : "#7DCEA0"}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.itemText,
            isCompleted ? styles.completedText : undefined,
          ]}
        >
          {name}
          <Text style={styles.quantity}> {quantity}</Text>
        </Text>
      </View>
      <TouchableOpacity onPress={handleDelete} activeOpacity={0.8}>
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomColor: theme.colorCerulean,
    // borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#fff",
  },
  completedContainer: {
    backgroundColor: theme.colorLightGrey,
    borderBottomColor: theme.colorLightGrey,
  },
  completedText: {
    textDecorationLine: "line-through",
    textDecorationColor: theme.colorGrey,
    color: theme.colorGrey,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  quantity: {
    fontStyle: "italic",
    marginLeft: 10,
    fontWeight: "normal",
    color: "grey",
    fontSize: 15,
  },
});
