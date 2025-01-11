import { Text, View, Pressable } from "react-native";
import Icon from "../../icons/Icon";
import { useNavigation } from "@react-navigation/native";
import {
  ARCHIVE_COLLAGE,
  DELETE_COLLAGE,
  UNARCHIVE_COLLAGE,
} from "../../utils/mutations";
import { useAdminProfile } from "../../contexts/AdminProfileContext";
import { useMutation } from "@apollo/client";
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import BottomPopup from "../BottomPopup";
import DangerAlert from "../../alerts/DangerAlert";
import { useState } from "react";

export default function AuthorCollageOptions({
  visible,
  onRequestClose,
  collageId,
  collageData,
  isArchived: initialIsArchived,
  isViewCollageScreen = false,
  currentIndex,
}) {
  const navigation = useNavigation();
  const { addCollage, removeCollage } = useAdminProfile();

  // Local archive state
  const [isArchived, setIsArchived] = useState(initialIsArchived);

  // Initialize mutations
  const [archiveCollage] = useMutation(ARCHIVE_COLLAGE);
  const [unarchiveCollage] = useMutation(UNARCHIVE_COLLAGE);
  const [deleteCollage] = useMutation(DELETE_COLLAGE);

  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

  // Handle archive/unarchive toggle
  const handleArchive = async () => {
    try {
      if (isArchived) {
        const { data } = await unarchiveCollage({ variables: { collageId } });
        if (data?.unarchiveCollage?.success) {
          setIsArchived(false); // Update state
          addCollage({
            _id: collageId,
            coverImage: collageData.coverImage,
            createdAt: collageData.createdAt,
          });
        }
      } else {
        const { data } = await archiveCollage({ variables: { collageId } });
        if (data?.archiveCollage?.success) {
          setIsArchived(true); // Update state
          removeCollage(collageId);
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
        removeCollage(collageId);
      }
    } catch (error) {
      console.error("Error deleting collage:", error.message);
    } finally {
      setIsDeleteAlertVisible(false);
    }
  };

  const shareOptions = [
    { name: "Copy Link", icon: "link.circle", onPress: () => {} },
    { name: "Message", icon: "message.circle", onPress: () => {} },
    { name: "Instagram", icon: "logo.instagram", onPress: () => {} },
    { name: "Facebook", icon: "logo.facebook", onPress: () => {} },
    { name: "Snapchat", icon: "logo.snapchat", onPress: () => {} },
  ];

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={484}
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>Options</Text>

        {/* Edit */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => {
            onRequestClose();
            navigation.navigate("EditMedia", {
              collageId,
              collageData,
              currentIndex,
              returnTo:
                navigation.getState().routes[navigation.getState().index]?.name,
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
        </Pressable>

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
