import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import BottomPopup from "../BottomPopup";
import Icon from "../../icons/Icon";
import DangerAlert from "../../alerts/DangerAlert";
import { useCameraAlbums } from "../../contexts/CameraAlbumContext";

export default function AlbumOptions({
  visible,
  albumId,
  onRequestClose,
  onEditAlbum,
  navigation,
}) {
  const { removeAlbumFromCache } = useCameraAlbums();

  const [alertVisible, setAlertVisible] = useState(false);

  // Handle album deletion
  const handleDeleteAlbum = () => {
    setAlertVisible(true);
  };

  const confirmDeleteAlbum = async () => {
    setAlertVisible(false);
    try {
      await removeAlbumFromCache(albumId);
      onRequestClose();
      navigation.navigate("CameraRoll");
    } catch (error) {
      console.error("[ViewAlbum] Failed to delete album:", error);
      Alert.alert("Error", "Failed to delete album.");
    }
  };

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={184} // Adjusted for two options
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>Album Options</Text>

        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => {
            onEditAlbum();
            onRequestClose();
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

        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleDeleteAlbum}
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
        {/* Danger Alert for Deletion */}
        <DangerAlert
          visible={alertVisible}
          onRequestClose={() => setAlertVisible(false)}
          title="Delete Album"
          message="Are you sure you want to delete this album? This action cannot be undone."
          onConfirm={confirmDeleteAlbum}
          onCancel={() => setAlertVisible(false)}
          cancelButtonText="Discard"
        />
      </View>
    </BottomPopup>
  );
}
