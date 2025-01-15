import { StyleSheet, TextInput, FlatList, View, Text } from "react-native";
import ShoppingListItem from "../components/ShoppingListItem";
import { theme } from "../theme";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";

const storageKey = "shopping-List";

type ShoppingListItemType = {
  id: string;
  name: string;
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

  function handleSubmit() {
    if (item) {
      const newShoppingList = [
        {
          id: new Date().toTimeString(),
          name: item,
          lastUpdatedTimestamp: Date.now(),
        },
        ...shoppingList,
      ];
      saveToStorage(storageKey, newShoppingList);
      setShoppingList(newShoppingList);
      setItem("");
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
        <TextInput
          placeholder=".e.g Coffee"
          style={styles.textInput}
          value={item}
          onChangeText={setItem}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
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
    backgroundColor: "#fff",
    paddingTop: 12,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  textInput: {
    borderColor: theme.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
    backgroundColor: "#fff",
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
