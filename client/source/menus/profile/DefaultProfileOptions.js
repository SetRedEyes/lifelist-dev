import React, { useState } from "react";
import { Text, View, Pressable, Alert } from "react-native";
import BottomPopup from "../BottomPopup";
import Icon from "../../icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { useMutation } from "@apollo/client";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import {
  BLOCK_USER,
  UNBLOCK_USER,
} from "../../utils/mutations/userRelationMutations";
import DangerAlert from "../../alerts/DangerAlert";

export default function DefaultProfileOptions({
  visible,
  onRequestClose,
  profileId,
  isBlockedByCurrentUser,
  unblockUser,
  refetchUserProfile, // Add refetch function as a prop
}) {
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);

  // Mutation for blocking the user
  const [blockUser] = useMutation(BLOCK_USER, {
    onCompleted: () => {
      alert("User blocked successfully!");
      setAlertVisible(false);
      onRequestClose();
      refetchUserProfile(); // Refetch profile data after blocking
    },
    onError: (error) => {
      alert(`Error blocking user: ${error.message}`);
    },
  });

  // Mutation for unblocking the user
  const [unblockUserMutation] = useMutation(UNBLOCK_USER, {
    onCompleted: () => {
      alert("User unblocked successfully!");
      unblockUser(); // Trigger callback to update UI
      onRequestClose();
      refetchUserProfile(); // Refetch profile data after unblocking
    },
    onError: (error) => {
      alert(`Error unblocking user: ${error.message}`);
    },
  });

  // Share Profile
  const handleShareProfile = async () => {
    const profileURL = `https://example.com/profile/${profileId}`;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(profileURL, {
          dialogTitle: "Share Profile",
          mimeType: "text/plain",
        });
      } else {
        alert("Sharing is not available on your device");
      }
    } catch (error) {
      console.error("Error sharing profile:", error);
      alert("Failed to share profile");
    }
  };

  // Copy Profile URL
  const handleCopyProfileURL = () => {
    const profileURL = `https://example.com/profile/${profileId}`;
    Clipboard.setStringAsync(profileURL);
    alert("Profile URL copied to clipboard!");
  };

  // Handle Block User
  const handleBlockUser = () => {
    blockUser({ variables: { userIdToBlock: profileId } });
  };

  // Handle Unblock User
  const handleUnblockUser = () => {
    unblockUserMutation({ variables: { userIdToUnblock: profileId } });
  };

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={276}
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>Profile Options</Text>

        {/* Share Profile */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleShareProfile}
        >
          <View style={menuStyles.flexRow}>
            <Icon name="paperplane.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>
              Share Profile
            </Text>
          </View>
        </Pressable>

        {/* Copy Profile URL */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleCopyProfileURL}
        >
          <View style={menuStyles.flexRow}>
            <Icon name="doc.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>
              Copy Profile URL
            </Text>
          </View>
        </Pressable>

        {/* Block or Unblock */}
        {isBlockedByCurrentUser ? (
          <Pressable
            style={[menuStyles.cardContainer, menuStyles.flex]}
            onPress={handleUnblockUser}
          >
            <Text
              style={[
                menuStyles.spacer,
                menuStyles.popupText,
                { color: "red", fontWeight: "500" },
              ]}
            >
              Unblock
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[menuStyles.cardContainer, menuStyles.flex]}
            onPress={() => setAlertVisible(true)}
          >
            <Text
              style={[
                menuStyles.spacer,
                menuStyles.popupText,
                { color: "red", fontWeight: "500" },
              ]}
            >
              Block
            </Text>
          </Pressable>
        )}

        {/* Report */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => {
            onRequestClose();
            navigation.navigate("Report", {
              entityId: profileId,
              entityType: "PROFILE",
            });
          }}
        >
          <Text
            style={[
              menuStyles.spacer,
              menuStyles.popupText,
              { color: "red", fontWeight: "500" },
            ]}
          >
            Report
          </Text>
        </Pressable>
      </View>

      {/* DangerAlert */}
      <DangerAlert
        visible={alertVisible}
        onRequestClose={() => setAlertVisible(false)}
        title="Block User?"
        message="Are you sure you want to block this user? This action cannot be undone."
        confirmButtonText="Block"
        cancelButtonText="Cancel"
        onConfirm={handleBlockUser}
        onCancel={() => setAlertVisible(false)}
      />
    </BottomPopup>
  );
}
