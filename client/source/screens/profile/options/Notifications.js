import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Pressable,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client";
import { DELETE_NOTIFICATION } from "../../../utils/mutations";
import NotificationCard from "../../../cards/user/NotificationCard";
import { notificationsStyles } from "../../../styles/screens/notificationStyles";
import SearchBar from "../../../headers/SearchBar";
import { GET_USER_NOTIFICATIONS } from "../../../utils/queries/userQueries";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";

export default function Notifications({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = useQuery(GET_USER_NOTIFICATIONS);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION);
  const [notifications, setNotifications] = useState([]);
  const [followRequestsCount, setFollowRequestsCount] = useState(0);
  const searchBarRef = useRef(null); // Ref for the SearchBar

  const { adminProfile } = useAdminProfile();
  const isProfilePrivate = adminProfile?.settings?.isProfilePrivate ?? false;

  // Populate notifications on data change
  useEffect(() => {
    if (data?.getUserNotifications?.notifications) {
      const sortedNotifications = data.getUserNotifications.notifications
        .filter((notification) => notification.sender !== null)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sortedNotifications);

      // Update follow requests count
      setFollowRequestsCount(data.getUserNotifications.followRequestsCount);
    }
  }, [data]);

  // Filter notifications based on search query
  useEffect(() => {
    if (data?.getUserNotifications?.notifications) {
      const filteredNotifications =
        data.getUserNotifications.notifications.filter(
          (notification) =>
            notification.sender &&
            notification.sender.fullName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      setNotifications(filteredNotifications);
    }
  }, [searchQuery, data]);

  // Handle delete notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification({ variables: { notificationId } });
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Dismiss the keyboard and blur the search bar
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (searchBarRef.current) {
      searchBarRef.current.blur();
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error fetching notifications: {error.message}</Text>;
  }

  // Render notification card
  const renderItem = ({ item }) => (
    <NotificationCard
      notificationId={item._id}
      senderId={item.sender._id}
      senderName={item.sender.fullName}
      senderProfilePicture={item.sender.profilePicture}
      message={item.message}
      createdAt={item.createdAt}
      onDelete={handleDelete}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={notificationsStyles.container}>
        {/* Search Bar */}
        <View
          style={[notificationsStyles.searchBarContainer, { paddingBottom: 8 }]}
        >
          <SearchBar
            ref={searchBarRef}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={() => {}}
            onFocusChange={() => {}}
          />
        </View>

        {/* Conditionally Render Friend Requests */}
        {isProfilePrivate && (
          <Pressable
            onPress={() => navigation.navigate("FriendRequests")}
            style={notificationsStyles.friendRequestCard}
          >
            <Text style={notificationsStyles.friendRequestText}>
              Friend Requests: {followRequestsCount}
            </Text>
          </Pressable>
        )}

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={notificationsStyles.flatListContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
