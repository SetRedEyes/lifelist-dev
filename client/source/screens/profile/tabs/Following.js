import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useQuery } from "@apollo/client";
import UserRelationCard from "../../../cards/user/UserRelationCard";
import DangerAlert from "../../../alerts/DangerAlert";
import { GET_FOLLOWING } from "../../../utils/queries/userQueries";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useProfile } from "../../../contexts/ProfileContext";
import { useFocusEffect } from "@react-navigation/native";

const PAGE_SIZE = 20;

export default function Following({ userId, searchQuery }) {
  const [following, setFollowing] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  const { followUser, unfollowUser, sendFollowRequest, unsendFollowRequest } =
    useProfile();
  const { incrementFollowing, decrementFollowing } = useAdminProfile();

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_FOLLOWING, {
    variables: { userId, cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only", // Always fetch fresh data
    onCompleted: (fetchedData) => {
      const { users, nextCursor, hasNextPage } = fetchedData.getFollowing;

      // Remove duplicates and update state
      const newUniqueFollowing = users.filter(
        (newFollowing) =>
          !following.some(
            (existing) => existing.user._id === newFollowing.user._id
          )
      );
      setFollowing((prev) => [...prev, ...newUniqueFollowing]);
      setCursor(nextCursor);
      setHasMore(hasNextPage);
    },
  });

  useFocusEffect(
    useCallback(() => {
      // Refetch data when the screen is focused
      refetch();
    }, [refetch])
  );

  // === Handle Action Press ===
  const handleActionPress = async (targetUserId, action, isPrivate) => {
    try {
      if (action === "Follow") {
        if (isPrivate) {
          await sendFollowRequest(targetUserId);
          Alert.alert("Request Sent", "Follow request has been sent.");
          return "Requested";
        } else {
          await followUser(targetUserId);
          incrementFollowing(); // Increment following count when following someone
          Alert.alert("Follow", "You are now following this user.");
          return "Following";
        }
      } else if (action === "Following") {
        if (isPrivate) {
          // Show DangerAlert to confirm unfollowing a private user
          setTargetUserId(targetUserId);
          setShowDangerAlert(true);
          return action;
        } else {
          await unfollowUser(targetUserId);
          decrementFollowing(); // Decrement following count
          setFollowing((prev) =>
            prev.filter((user) => user.user._id !== targetUserId)
          );
          Alert.alert("Unfollow", "You have unfollowed this user.");
          return "Follow";
        }
      } else if (action === "Requested") {
        await unsendFollowRequest(targetUserId);
        Alert.alert("Request Withdrawn", "Follow request has been withdrawn.");
        return "Follow";
      }
    } catch (error) {
      Alert.alert("Action Error", error.message);
      return action; // Return the current action if there's an error
    }
  };

  // === Confirm Unfollow Action ===
  const handleConfirmUnfollow = async () => {
    try {
      await unfollowUser(targetUserId);
      decrementFollowing(); // Decrement following count
      setFollowing((prev) =>
        prev.filter((user) => user.user._id !== targetUserId)
      );
      setShowDangerAlert(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const loadMore = async () => {
    if (hasMore && !loading) {
      await fetchMore({
        variables: { userId, cursor, limit: PAGE_SIZE },
      });
    }
  };

  const filteredFollowing = following.filter((user) =>
    user.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFollowingItem = ({ item }) => {
    // Determine the initial button state based on relationshipStatus
    const initialAction =
      item.relationshipStatus === "Following"
        ? "Following"
        : item.relationshipStatus === "Requested"
        ? "Requested"
        : "Follow";

    return (
      <UserRelationCard
        user={item.user}
        initialAction={initialAction}
        onActionPress={handleActionPress}
        isPrivate={item.user.settings?.isProfilePrivate}
      />
    );
  };

  return (
    <>
      <FlatList
        data={filteredFollowing}
        renderItem={renderFollowingItem}
        keyExtractor={(item) => item.user._id.toString()}
        style={{ flex: 1, marginHorizontal: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
      />

      {/* Danger Alert for confirming unfollow action */}
      <DangerAlert
        visible={showDangerAlert}
        title="Unfollow Private User?"
        message="Are you sure you want to unfollow this private user? You will lose access to their content."
        confirmButtonText="Unfollow"
        onConfirm={handleConfirmUnfollow}
        onCancel={() => setShowDangerAlert(false)}
      />
    </>
  );
}
