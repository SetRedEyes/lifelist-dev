import { useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Animated, FlatList, Text } from "react-native";
import AdminProfileOptions from "../../menus/profile/AdminProfileOptions";
import { useAdminProfile } from "../../contexts/AdminProfileContext";
import ProfileNavigator from "../../navigators/profile/ProfileNavigator";
import ProfileOverview from "./components/ProfileOverview";
import ButtonIcon from "../../icons/ButtonIcon";
import { useAuth } from "../../contexts/AuthContext";
import {
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../styles/components/index";

export default function AdminProfile() {
  const navigation = useNavigation();
  const [optionsPopupVisible, setOptionsPopupVisible] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const {
    adminProfile,
    collages,
    reposts,
    counts,
    hasActiveMoments,
    fetchMoreCollages,
    fetchMoreReposts,
  } = useAdminProfile();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Animate the rotation based on the popup visibility
    Animated.timing(rotateAnim, {
      toValue: optionsPopupVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [optionsPopupVisible]);

  const toggleOptionsPopup = useCallback(() => {
    setOptionsPopupVisible((prev) => !prev);
  }, []);

  const rotation = useMemo(() => {
    return rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"],
    });
  }, [rotateAnim]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <Text style={headerStyles.headerLeftText}>
            {adminProfile?.fullName || "Admin Profile"}
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          {/* Notifications */}
          <ButtonIcon
            name="bell"
            style={symbolStyles.bell}
            weight="medium"
            onPress={() => navigation.navigate("Notifications")}
          />

          {/* Options Button with Rotation */}
          <Animated.View
            style={{
              transform: [{ rotate: rotation }],
              marginLeft: 16,
            }}
          >
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
  }, [navigation, rotation, toggleOptionsPopup, adminProfile?.fullName]);

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={[{ key: "Collages", component: ProfileNavigator }]}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <ProfileNavigator
            userId={currentUser}
            isAdmin
            isAdminScreen
            navigation={navigation}
            collages={collages}
            reposts={reposts}
            fetchMoreCollages={fetchMoreCollages}
            fetchMoreReposts={fetchMoreReposts}
            hasActiveMoments={hasActiveMoments}
          />
        )}
        ListHeaderComponent={() => (
          <ProfileOverview
            profile={adminProfile}
            followerData={{
              followersCount: counts.followersCount,
              followingCount: counts.followingCount,
              collagesCount: counts.collagesCount,
            }}
            userId={currentUser}
            isAdminView
            isAdminScreen
          />
        )}
        style={layoutStyles.container}
        showsVerticalScrollIndicator={false}
      />
      <AdminProfileOptions
        visible={optionsPopupVisible}
        onRequestClose={toggleOptionsPopup}
        navigation={navigation}
      />
    </View>
  );
}
