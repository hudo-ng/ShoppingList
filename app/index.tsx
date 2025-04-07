import { StyleSheet, TextInput, FlatList, View, Text } from "react-native";
import ShoppingListItem from "../components/ShoppingListItem";
import { theme } from "../theme";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";

const storageKey = "shopping-List";

type ShoppingListItemType = {
  id: string;
  name: string;
  quantity?: string; //optional
  completedAtTimestamp?: number;
  lastUpdatedTimestamp: number;
};

// const initialList: ShoppingListItemType[] = [
//   { id: "1", name: "Coffee" },
//   { id: "2", name: "Tea" },
//   { id: "3", name: "Sugar" },
// ];

export default function App() {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(storageKey);
      if (data) {
        setShoppingList(data);
      }
    };
    fetchInitial();
  }, []);

  // handle submit item name + quantity (optional)
  function handleSubmit() {
    if (item) {
      // Checking if add duplicated items
      const exit = shoppingList.some(
        (aitem) => aitem.name.toLowerCase() === item.toLowerCase(),
      );

      if (!exit) {
        const newShoppingList = [
          {
            id: new Date().toTimeString(),
            name: item,
            quantity: quantity,
            lastUpdatedTimestamp: Date.now(),
          },
          ...shoppingList,
        ];
        saveToStorage(storageKey, newShoppingList);
        setShoppingList(newShoppingList);
        setItem("");
        setQuantity("");
      } else {
        alert("Item is already added!");
      }
    }
  }

  function handleDelete(id: string) {
    const newShoppingList = shoppingList.filter((item) => item.id !== id);
    saveToStorage(storageKey, newShoppingList);
    setShoppingList(newShoppingList);
  }

  function handleToggleComplete(id: string) {
    const newShoppingList = shoppingList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          completedAtTimestamp: item.completedAtTimestamp
            ? undefined
            : Date.now(),
          lastUpdatedTimestamp: Date.now(),
        };
      }
      return item;
    });
    saveToStorage(storageKey, newShoppingList);
    setShoppingList(newShoppingList);
  }

  return (
    <FlatList
      data={orderShoppingList(shoppingList)}
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          quantity={item.quantity}
          onDelete={() => handleDelete(item.id)}
          onToggleComplete={() => handleToggleComplete(item.id)}
          isCompleted={Boolean(item.completedAtTimestamp)}
        />
      )}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>Your shopping list is empty</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.input}>
          {/* Item input */}
          <TextInput
            placeholder=".e.g Coffee"
            style={styles.textInput}
            value={item}
            onChangeText={setItem}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          {/* Quantity input if have item input*/}

          <TextInput
            placeholder=".e.g 1kg"
            style={[styles.quantityInput]}
            value={quantity}
            onChangeText={setQuantity}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
        </View>
      }
    />
    // <ScrollView
    //   style={styles.container}
    //   contentContainerStyle={styles.contentContainer}
    //   stickyHeaderIndices={[0]}
    // >
    //   <TextInput
    //     placeholder=".e.g Coffee"
    //     style={styles.textInput}
    //     value={item}
    //     onChangeText={setItem}
    //     onSubmitEditing={handleSubmit}
    //     returnKeyType="done"
    //   />
    //   {shoppingList.map((i) => (
    //     <ShoppingListItem name={i.name} key={i.id} />
    //   ))}
    //   <StatusBar style="auto" />
    // </ScrollView>
  );
}

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }

    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }

    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }

    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
    }

    return 0;
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 12,
  },
  contentContainer: {
    paddingBottom: 24,
    gap: 10,
    backgroundColor: "#F2F2F7",
  },
  input: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
    // backgroundColor: "#fff",
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginLeft: 20,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
    fontWeight: "bold",
    width: "60%",
    backgroundColor: "#fff",
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
  quantityInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: "auto",
    marginBottom: 12,
    fontSize: 15,
    borderRadius: 50,
    width: "28%",
    marginRight: 20,
    backgroundColor: "#fff",
  },
});
