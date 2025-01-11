import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { View, FlatList, Animated, RefreshControl, Text } from "react-native";
import DefaultProfileOptions from "../../menus/profile/DefaultProfileOptions";
import AdminProfileOptions from "../../menus/profile/AdminProfileOptions";
import ProfileOverview from "./components/ProfileOverview";
import ProfileNavigator from "../../navigators/profile/ProfileNavigator";
import { useNavigation, useRoute } from "@react-navigation/native";
import ButtonIcon from "../../icons/ButtonIcon";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";
import DangerAlert from "../../alerts/DangerAlert";
import {
  layoutStyles,
  headerStyles,
  symbolStyles,
  containerStyles,
} from "../../styles/components/index";
import LockIcon from "../../icons/authentication/LockIcon";

export default function Profile() {
  const navigation = useNavigation();
  const route = useRoute();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [optionsPopupVisible, setOptionsPopupVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [blockAlertVisible, setBlockAlertVisible] = useState(false); // Track DangerAlert visibility

  const { currentUser } = useAuth();
  const {
    fetchUserProfile,
    profileData,
    collages,
    reposts,
    fetchMoreCollages,
    fetchMoreReposts,
    collagesCursor,
    repostsCursor,
    hasNextCollagesPage,
    hasNextRepostsPage,
  } = useProfile();

  const userId = route.params?.userId || currentUser;
  const isAdminView = currentUser && userId === currentUser;

  // Fetch profile data when userId changes or on mount
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId); // Call the function from ProfileContext
    }
  }, [userId]);

  // Toggle options popup visibility
  const toggleOptionsPopup = useCallback(() => {
    setOptionsPopupVisible((prev) => !prev);
  }, []);

  // Animate rotation for options button
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: optionsPopupVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [optionsPopupVisible]);

  const rotation = useMemo(() => {
    return rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"],
    });
  }, [rotateAnim]);

  // Configure header dynamically
  useEffect(() => {
    navigation.setOptions({
      title: profileData?.fullName,
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          {/* Options Button */}
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <ButtonIcon
              name="ellipsis"
              weight="bold"
              style={symbolStyles.ellipsis}
              onPress={toggleOptionsPopup}
            />
          </Animated.View>
        </View>
      ),
    });
  }, [
    navigation,
    toggleOptionsPopup,
    rotation,
    profileData?.fullName,
    setBlockAlertVisible,
    blockAlertVisible,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile(userId); // Fetch updated profile data
    } finally {
      setRefreshing(false);
    }
  };

  const handleFetchMoreCollages = async () => {
    if (collagesCursor && hasNextCollagesPage) {
      await fetchMoreCollages();
    }
  };

  const handleFetchMoreReposts = async () => {
    if (repostsCursor && hasNextRepostsPage) {
      await fetchMoreReposts();
    }
  };

  const handleBlockUser = () => {
    blockUserMutation({ variables: { userIdToBlock: userId } });
    setBlockAlertVisible(false);
    setOptionsPopupVisible(false);
  };

  const showPrivate =
    profileData?.isProfilePrivate && !profileData?.isFollowing && !isAdminView;

  const renderContent = () => (
    <>
      <ProfileOverview
        profile={profileData}
        followerData={{
          followersCount: profileData?.followersCount || 0,
          followingCount: profileData?.followingCount || 0,
          collagesCount: collages?.length || profileData?.collagesCount || 0,
        }}
        userId={userId}
        isAdminView={isAdminView}
      />
      {showPrivate ? (
        <View style={containerStyles.privateContainer}>
          <LockIcon borderColor="#696969" color="#696969" />
          <Text style={containerStyles.privateText}>User is Private.</Text>
        </View>
      ) : (
        <ProfileNavigator
          userId={userId}
          isAdmin={isAdminView}
          collages={collages}
          reposts={reposts}
          fetchMoreCollages={handleFetchMoreCollages}
          fetchMoreReposts={handleFetchMoreReposts}
        />
      )}
    </>
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={[{ key: "profile" }]}
        keyExtractor={(item) => item.key}
        renderItem={renderContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
        style={layoutStyles.container}
      />
      {isAdminView ? (
        <AdminProfileOptions
          visible={optionsPopupVisible}
          onRequestClose={toggleOptionsPopup}
          navigation={navigation}
        />
      ) : (
        <DefaultProfileOptions
          visible={optionsPopupVisible}
          onRequestClose={toggleOptionsPopup}
          profileId={userId}
          blockAlert={() => setBlockAlertVisible(true)}
        />
      )}

      {/* DangerAlert */}
      <DangerAlert
        visible={blockAlertVisible}
        title="Block User?"
        message="Are you sure you want to block this user? This action cannot be undone."
        confirmButtonText="Block"
        cancelButtonText="Cancel"
        onConfirm={handleBlockUser}
        onCancel={() => setBlockAlertVisible(false)}
      />
    </View>
  );
}
