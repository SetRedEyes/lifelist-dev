import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import UserSelectCard from "../../../cards/user/UserSelectCard";
import SearchBar from "../../../headers/SearchBar";
import ButtonIcon from "../../../icons/ButtonIcon";
import { GET_ALL_USERS } from "../../../utils/queries/userQueries";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import {
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../../styles/components";
import { useLazyQuery } from "@apollo/client";

export default function TagUsers() {
  const navigation = useNavigation();
  const { collage, updateCollage } = useCreateCollageContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [hasModified, setHasModified] = useState(false);

  // Lazy query to fetch users
  const [loadUsers, { data: allUsersData, loading }] = useLazyQuery(
    GET_ALL_USERS,
    {
      fetchPolicy: "network-only",
    }
  );

  // Initialize selectedUsers from collage.taggedUsers once
  useEffect(() => {
    setSelectedUsers([...collage.taggedUsers]);
  }, [collage.taggedUsers]);

  // Search when the query changes (debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        loadUsers({ variables: { searchQuery, limit: 10, cursor: null } });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Update selected users and check for changes
  const handleSelectUser = (user) => {
    const userId = user._id || user.user._id; // Handle both formats
    const isSelected = selectedUsers.some((u) => u._id === userId);

    let updatedUsers;
    if (isSelected) {
      // Remove user
      updatedUsers = selectedUsers.filter((u) => u._id !== userId);
    } else {
      // Add user
      updatedUsers = [...selectedUsers, user.user || user];
    }

    setSelectedUsers(updatedUsers);
    setHasModified(true);
  };

  // Save tagged users to the context and navigate back
  const handleSaveTaggedUsers = () => {
    if (hasModified) {
      updateCollage({ taggedUsers: selectedUsers });
    }
    navigation.goBack();
  };

  // Configure header dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <View style={headerStyles.headerContainer}>
          <View style={{ marginLeft: 16 }}>
            <ButtonIcon
              name="chevron.backward"
              weight="medium"
              onPress={() => navigation.goBack()}
              style={symbolStyles.backArrow}
            />
          </View>
          <View
            style={[headerStyles.searchBarContainer, { marginHorizontal: 16 }]}
          >
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onFocusChange={setIsSearchFocused}
            />
          </View>
          <Pressable
            onPress={handleSaveTaggedUsers}
            disabled={!hasModified}
            style={{ marginRight: 16 }}
          >
            <Text
              style={[
                headerStyles.saveButtonText,
                hasModified && headerStyles.saveButtonTextActive,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [
    navigation,
    searchQuery,
    hasModified,
    handleSaveTaggedUsers,
    selectedUsers,
  ]);

  // Decide which data to display
  const usersToDisplay = searchQuery
    ? (allUsersData?.getAllUsers?.users || []).map((user) => ({
        ...user.user,
        relationshipStatus: user.relationshipStatus,
        isSelected: selectedUsers.some((u) => u._id === user.user._id),
      }))
    : selectedUsers;

  return (
    <Pressable
      style={layoutStyles.wrapper}
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <FlatList
        data={usersToDisplay}
        renderItem={({ item }) => (
          <UserSelectCard
            user={item}
            isSelected={selectedUsers.some((u) => u._id === item._id)}
            onSelect={handleSelectUser}
          />
        )}
        keyExtractor={(item) => item._id.toString()}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#121212",
  },
  searchBarContainer: {
    flex: 1,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#d4d4d4",
  },
  saveButtonTextActive: {
    color: "#6AB952",
  },
});
