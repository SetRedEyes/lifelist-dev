import React, { useState } from "react";
import { View, StyleSheet, Pressable, Keyboard } from "react-native";
import { useRoute } from "@react-navigation/native";
import SearchBar from "../../headers/SearchBar";
import UserRelationsNavigator from "../../navigators/profile/UserRelationsNavigator";

export default function UserRelations() {
  const route = useRoute();
  const { userId, initialTab } = route.params;

  // State for the search query
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Pressable style={styles.container} onPress={() => Keyboard.dismiss()}>
      <View style={{ marginHorizontal: 16, marginTop: 16 }}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={() => console.log("Search submitted:", searchQuery)}
          onFocusChange={() => {}}
        />
      </View>
      <UserRelationsNavigator
        userId={userId}
        initialTab={initialTab}
        searchQuery={searchQuery} // Pass searchQuery down
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
