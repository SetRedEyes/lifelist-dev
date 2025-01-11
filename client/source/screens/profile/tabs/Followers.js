import React, { useState } from "react";
import { FlatList } from "react-native";
import { useQuery } from "@apollo/client";
import UserRelationCard from "../../../cards/user/UserRelationCard";
import { GET_FOLLOWERS } from "../../../utils/queries/userQueries";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useProfile } from "../../../contexts/ProfileContext";
import DangerAlert from "../../../alerts/DangerAlert";

const PAGE_SIZE = 20;

export default function Followers({ userId, searchQuery }) {
  const [followers, setFollowers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  const { followUser, unfollowUser, sendFollowRequest, unsendFollowRequest } =
    useProfile();
  const { incrementFollowing, decrementFollowing } = useAdminProfile();

  const { data, loading, error, fetchMore } = useQuery(GET_FOLLOWERS, {
    variables: { userId, cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
    onCompleted: (fetchedData) => {
      const { users, nextCursor, hasNextPage } = fetchedData.getFollowers;

      // Remove duplicates and update state
      const newUniqueFollowers = users.filter(
        (newFollower) =>
          !followers.some(
            (existing) => existing.user._id === newFollower.user._id
          )
      );
      setFollowers((prev) => [...prev, ...newUniqueFollowers]);
      setCursor(nextCursor);
      setHasMore(hasNextPage);
    },
  });

  // === Handle Action Press ===
  const handleActionPress = async (userId, action, isPrivate) => {
    if (action === "Follow") {
      if (isPrivate) {
        await sendFollowRequest(userId);
        return "Requested";
      } else {
        await followUser(userId);
        incrementFollowing();
        return "Following";
      }
    } else if (action === "Following") {
      if (isPrivate) {
        // Show the DangerAlert for private user unfollow confirmation
        setTargetUserId(userId);
        setShowDangerAlert(true);
        return action; // Return the current action until confirmed
      } else {
        await unfollowUser(userId);
        decrementFollowing();
        return "Follow";
      }
    } else if (action === "Requested") {
      await unsendFollowRequest(userId);
      return "Follow";
    }
  };

  // === Confirm Unfollow ===
  const handleConfirmUnfollow = async () => {
    try {
      await unfollowUser(targetUserId);
      decrementFollowing();
      setFollowers((prev) =>
        prev.filter((follower) => follower.user._id !== targetUserId)
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

  const filteredFollowers = followers.filter((follower) =>
    follower.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFollowerItem = ({ item }) => (
    <UserRelationCard
      user={item.user}
      initialAction={item.relationshipStatus}
      onActionPress={handleActionPress}
      isPrivate={item.isPrivate}
    />
  );

  return (
    <>
      <FlatList
        data={filteredFollowers}
        renderItem={renderFollowerItem}
        keyExtractor={(item) => item.user._id.toString()}
        style={{ flex: 1, marginHorizontal: 8 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />

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
