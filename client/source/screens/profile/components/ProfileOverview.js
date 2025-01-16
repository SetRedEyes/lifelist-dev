import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import DangerAlert from "../../../alerts/DangerAlert";
import { useNavigation } from "@react-navigation/native";
import { profileStyles } from "../../../styles/screens/profileStyles";
import { useProfile } from "../../../contexts/ProfileContext";
import ProfileActionButton from "../../../buttons/ProfileActionButton";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";

export default function ProfileOverview({
  profile,
  userId,
  followerData,
  isAdminView,
  isRestricted,
}) {
  const navigation = useNavigation();
  const {
    profileData,
    followUser,
    unfollowUser,
    sendFollowRequest,
    unsendFollowRequest,
  } = useProfile();
  const { incrementFollowing, decrementFollowing } = useAdminProfile();

  const [buttonState, setButtonState] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDangerAlert, setShowDangerAlert] = useState(false);

  useEffect(() => {
    updateButtonState();
  }, [isAdminView, profile, isRestricted]);

  const updateButtonState = () => {
    if (isRestricted) {
      setButtonState("Follow");
    } else if (isAdminView) {
      setButtonState("Edit Profile");
    } else if (profile?.isFollowing) {
      setButtonState("Following");
    } else if (profile?.isFollowRequested) {
      setButtonState("Pending Request");
    } else {
      setButtonState("Follow");
    }
  };

  // === Handle Follow Action ===
  const handleFollow = async () => {
    if (isRestricted || isProcessing) return;

    setIsProcessing(true);
    try {
      if (profile?.isProfilePrivate) {
        await sendFollowRequest(userId);
        Alert.alert("Request Sent", "Follow request sent.");
        setButtonState("Pending Request");
      } else {
        await followUser(userId);
        incrementFollowing();
        Alert.alert("Followed", "You are now following this user.");
        setButtonState("Following");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // === Handle Unfollow Action ===
  const handleUnfollow = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await unfollowUser(userId);
      decrementFollowing(); // ✅ Update following count
      Alert.alert("Unfollowed", "You have unfollowed this user.");
      setButtonState("Follow");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsendRequest = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await unsendFollowRequest(userId);
      Alert.alert("Request Withdrawn", "Follow request withdrawn.");
      setButtonState("Follow");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButton = () => {
    switch (buttonState) {
      case "Edit Profile":
        return (
          <ProfileActionButton
            onPress={() => navigation.push("EditProfile")}
            text="Edit Profile"
            backgroundColor="#252525"
            textColor="#fff"
          />
        );
      case "Following":
        return (
          <ProfileActionButton
            onPress={() => setShowDangerAlert(true)}
            text="Unfollow"
            backgroundColor="#222"
            textColor="#6AB952"
            disabled={isProcessing}
          />
        );
      case "Pending Request":
        return (
          <ProfileActionButton
            onPress={handleUnsendRequest}
            text="Pending Request"
            backgroundColor="#222"
            textColor="#fff"
            disabled={isProcessing}
          />
        );
      case "Follow":
      default:
        return (
          <ProfileActionButton
            onPress={handleFollow}
            text="Follow"
            backgroundColor="#222"
            textColor="#fff"
            disabled={isProcessing}
          />
        );
    }
  };

  const disableButtons =
    profileData?.isProfilePrivate && !profileData?.isFollowing && !isAdminView;

  return (
    <>
      <View style={profileStyles.overviewContainer}>
        <View style={profileStyles.profileHeader}>
          <Image
            source={{ uri: profile?.profilePicture }}
            style={profileStyles.profilePicture}
          />
          <View style={profileStyles.rightContainer}>
            <View style={profileStyles.followerStats}>
              {["Collages", "Followers", "Following"].map((item) => (
                <Pressable
                  key={item}
                  style={profileStyles.stat}
                  onPress={() => {
                    if (!disableButtons && item !== "Collages") {
                      navigation.push("UserRelations", {
                        userId,
                        initialTab: item,
                      });
                    }
                  }}
                >
                  <Text style={profileStyles.statValue}>
                    {followerData[`${item.toLowerCase()}Count`] || 0}
                  </Text>
                  <Text style={profileStyles.statLabel}>{item}</Text>
                </Pressable>
              ))}
            </View>
            {renderActionButton()}
          </View>
        </View>
        <View style={disableButtons && { marginBottom: 16 }}>
          <Text style={profileStyles.username}>@{profile?.username}</Text>
          <Text style={profileStyles.bio}>{profile?.bio}</Text>
        </View>
      </View>
      <DangerAlert
        visible={showDangerAlert}
        title="Unfollow User?"
        message="If you unfollow this private user, you will lose access to their content."
        confirmButtonText="Unfollow"
        onConfirm={() => {
          setShowDangerAlert(false);
          handleUnfollow();
        }}
        onCancel={() => setShowDangerAlert(false)}
      />
    </>
  );
}
