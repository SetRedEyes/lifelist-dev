import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_FOLLOW_REQUESTS } from "../../../utils/queries/notificationQueries";
import UserRequestCard from "../../../cards/user/UserRequestCard";
import SearchBar from "../../../headers/SearchBar";
import { notificationsStyles } from "../../../styles/screens/notificationStyles";

export default function FriendRequests({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchBarRef = useRef(null);
  const { data, loading, error } = useQuery(GET_FOLLOW_REQUESTS);
  const [followRequests, setFollowRequests] = useState([]);

  // Populate follow requests on data change
  useEffect(() => {
    if (data?.getFollowRequests) {
      setFollowRequests(data.getFollowRequests);
    }
  }, [data]);

  // Filter follow requests based on search query
  useEffect(() => {
    if (data?.getFollowRequests) {
      const filteredRequests = data.getFollowRequests.filter((request) =>
        request.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFollowRequests(filteredRequests);
    }
  }, [searchQuery, data]);

  // Dismiss the keyboard and blur the search bar
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (searchBarRef.current) {
      searchBarRef.current.blur();
    }
  };

  // Remove a request from the list after accepting/declining
  const handleRemoveRequest = (userId) => {
    setFollowRequests((prev) =>
      prev.filter((request) => request._id !== userId)
    );
  };

  if (loading) {
    return (
      <View style={notificationsStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6AB952" />
      </View>
    );
  }

  if (error) {
    return <Text>Error fetching follow requests: {error.message}</Text>;
  }

  // Render user request card
  const renderItem = ({ item }) => (
    <UserRequestCard
      userId={item._id}
      fullName={item.fullName}
      username={item.username}
      profilePicture={item.profilePicture}
      onRemoveRequest={handleRemoveRequest}
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

        {/* Follow Requests List */}
        <FlatList
          data={followRequests}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={notificationsStyles.flatListContent}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
