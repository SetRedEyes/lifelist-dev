import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLazyQuery, useMutation } from "@apollo/client";
import UserBlockedCard from "../../../cards/user/UserBlockedCard";
import { GET_BLOCKED_USERS } from "../../../utils/queries/userQueries";
import { UNBLOCK_USER } from "../../../utils/mutations/userRelationMutations";
import {
  layoutStyles,
  containerStyles,
} from "../../../styles/components/index";

export default function BlockedUsers() {
  const navigation = useNavigation();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blocked users from the server
  const [fetchBlockedUsers, { data, loading, error }] =
    useLazyQuery(GET_BLOCKED_USERS);

  // Mutation to unblock a user
  const [unblockUser] = useMutation(UNBLOCK_USER, {
    onCompleted: (data) => {
      if (data.unblockUser.success) {
        setBlockedUsers((prevUsers) =>
          prevUsers.filter(
            (user) => user._id !== data.unblockUser.userIdToUnblock
          )
        );
      }
    },
    onError: (err) => {
      console.error("Error unblocking user:", err.message);
    },
  });

  // Fetch users on mount
  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  // Update state when data is received
  useEffect(() => {
    if (data) {
      setBlockedUsers(data.getBlockedUsers);
      setIsLoading(false);
    }
  }, [data]);

  // Handle unblock action
  const handleUnblock = (userId) => {
    unblockUser({ variables: { userIdToUnblock: userId } });
  };

  // Render blocked user card
  const renderBlockedUserCard = ({ item }) => (
    <UserBlockedCard
      userId={item._id}
      fullName={item.fullName}
      username={item.username}
      profilePicture={item.profilePicture}
      onUnblock={handleUnblock}
    />
  );

  // Show loading spinner
  if (isLoading || loading) {
    return <ActivityIndicator size="large" color="#6AB952" />;
  }

  // Handle errors
  if (error) {
    console.error("Error loading blocked users:", error.message);
    return <Text>Error loading blocked users: {error.message}</Text>;
  }

  return (
    <View style={[layoutStyles.wrapper, { paddingHorizontal: 8 }]}>
      {/* Blocked Users List */}
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUserCard}
        keyExtractor={(item) => item._id.toString()}
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>
              You haven’t blocked anyone yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}
