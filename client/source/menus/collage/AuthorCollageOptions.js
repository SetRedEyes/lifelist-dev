import React, { useEffect, useState } from "react";
import { Text, View, Pressable, Alert } from "react-native";
import Icon from "../../icons/Icon";
import { useNavigation } from "@react-navigation/native";
import {
  ARCHIVE_COLLAGE,
  DELETE_COLLAGE,
  UNARCHIVE_COLLAGE,
} from "../../utils/mutations";
import { useAdminProfile } from "../../contexts/AdminProfileContext";
import { useCollageLists } from "../../contexts/CollageListsContext"; // Import the context
import { useMutation } from "@apollo/client";
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import BottomPopup from "../BottomPopup";
import DangerAlert from "../../alerts/DangerAlert";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

export default function AuthorCollageOptions({
  visible,
  onRequestClose,
  collageId,
  collage,
  isArchived: propIsArchived, // Rename the prop for clarity
  isViewCollageScreen = false,
  currentIndex,
  collages,
}) {
  const navigation = useNavigation();
  const { addCollage, removeCollage } = useAdminProfile();
  const { addCollageToContext, removeCollageFromContext } = useCollageLists(); // Access context utilities

  const [isArchived, setIsArchived] = useState(propIsArchived);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

  // Synchronize local state with prop changes
  useEffect(() => {
    setIsArchived(propIsArchived);
  }, [propIsArchived]);

  // Initialize mutations
  const [archiveCollage] = useMutation(ARCHIVE_COLLAGE);
  const [unarchiveCollage] = useMutation(UNARCHIVE_COLLAGE);
  const [deleteCollage] = useMutation(DELETE_COLLAGE);

  // Handle archive/unarchive toggle
  const handleArchive = async () => {
    try {
      if (isArchived) {
        const { data } = await unarchiveCollage({ variables: { collageId } });
        if (data?.unarchiveCollage?.success) {
          setIsArchived(false); // Update local state
          removeCollage(collageId); // Remove from AdminProfile
          removeCollageFromContext("archived", collageId); // Remove from context
          addCollageToContext("saved", {
            _id: collageId,
            coverImage: data.unarchiveCollage.collage.coverImage,
            createdAt: data.unarchiveCollage.collage.createdAt,
          }); // Optional: Move to "saved"
        }
      } else {
        const { data } = await archiveCollage({ variables: { collageId } });
        if (data?.archiveCollage?.success) {
          setIsArchived(true); // Update local state
          addCollage({
            _id: collageId,
            coverImage: data.archiveCollage.collage.coverImage,
            createdAt: data.archiveCollage.collage.createdAt,
          }); // Add to AdminProfile
          addCollageToContext("archived", {
            _id: collageId,
            coverImage: data.archiveCollage.collage.coverImage,
            createdAt: data.archiveCollage.collage.createdAt,
          }); // Add to context
        }
      }
    } catch (error) {
      console.error("Error archiving/unarchiving collage:", error.message);
    }
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    setIsDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const { data } = await deleteCollage({ variables: { collageId } });
      if (data?.deleteCollage?.success) {
        navigation.goBack(); // Navigate back after deletion
        removeCollage(collageId); // Remove from AdminProfile
        removeCollageFromContext("archived", collageId); // Remove from context
      }
    } catch (error) {
      console.error("Error deleting collage:", error.message);
    } finally {
      setIsDeleteAlertVisible(false);
    }
  };

  // Share Collage via Expo Sharing
  const handleShareCollage = async (imageUri) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(
        "Sharing Not Available",
        "Your device doesn't support sharing."
      );
      return;
    }

    try {
      await Sharing.shareAsync(imageUri);
    } catch (error) {
      console.error("Error sharing collage:", error);
    }
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: "link.circle",
      onPress: () => Clipboard.setStringAsync(collage.coverImage),
    },
    /*     {
      name: "Message",
      icon: "message.circle",
      onPress: () => handleShareCollage(collage.coverImage),
    },
    {
      name: "Instagram",
      icon: "logo.instagram",
      onPress: () =>
        Linking.openURL(`instagram://share?url=${collage.coverImage}`),
    },
    {
      name: "Facebook",
      icon: "logo.facebook",
      onPress: () =>
        Linking.openURL(
          `https://www.facebook.com/sharer/sharer.php?u=${collage.coverImage}`
        ),
    }, */
  ];

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={274}
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>Options</Text>
        {/* Edit */}
        {/*         <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => {
            onRequestClose();
            navigation.navigate("EditMedia", {
              collageId,
              collage,
              collages,
              currentIndex,
            });
          }}
        >
          <View style={menuStyles.flexRow}>
            <Icon
              name="pencil.and.outline"
              tintColor="#6AB952"
              weight="semibold"
              style={symbolStyles.popupIcon}
            />
            <Text style={[menuStyles.spacer, menuStyles.greenText]}>Edit</Text>
          </View>
          <Icon
            name="chevron.forward"
            style={symbolStyles.forwardArrow}
            weight="semibold"
            tintColor="#6AB952"
          />
        </Pressable> */}

        {/* Archive/Unarchive */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleArchive}
        >
          <View style={menuStyles.flexRow}>
            <Icon
              name={isArchived ? "archivebox.fill" : "archivebox"}
              style={symbolStyles.popupIcon}
              tintColor="#5FC4ED"
            />
            <Text style={[menuStyles.spacer, menuStyles.blueText]}>
              {isArchived ? "Unarchive" : "Archive"}
            </Text>
          </View>
        </Pressable>

        {/* Delete */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleDelete}
        >
          <View style={menuStyles.flexRow}>
            <Icon
              name="trash"
              style={symbolStyles.popupIcon}
              tintColor="#FF6347"
            />
            <Text style={[menuStyles.spacer, menuStyles.redText]}>Delete</Text>
          </View>
        </Pressable>

        <Text style={[menuStyles.header, menuStyles.shareHeader]}>Share</Text>
        {shareOptions.map((option, index) => (
          <Pressable
            key={index}
            style={[menuStyles.cardContainer, menuStyles.flex]}
            onPress={option.onPress}
          >
            <View style={menuStyles.flexRow}>
              <Icon name={option.icon} style={symbolStyles.popupIcon} />
              <Text style={[menuStyles.spacer, menuStyles.popupText]}>
                {option.name}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Delete Confirmation */}
      <DangerAlert
        visible={isDeleteAlertVisible}
        onRequestClose={() => setIsDeleteAlertVisible(false)}
        title="Delete Collage"
        message="Are you sure you want to delete this collage? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteAlertVisible(false)}
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
      />
    </BottomPopup>
  );
}
