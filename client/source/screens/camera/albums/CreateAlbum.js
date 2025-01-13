import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DangerAlert from "../../../alerts/DangerAlert";
import { useCameraAlbums } from "../../../contexts/CameraAlbumContext"; // CameraAlbum context
import { useCameraRoll } from "../../../contexts/CameraRollContext"; // CameraRoll context
import ButtonIcon from "../../../icons/ButtonIcon";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import {
  containerStyles,
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../../styles/components/index";

export default function CreateAlbum() {
  const navigation = useNavigation();
  const route = useRoute();
  const { albumTitle } = route.params;

  const [selectedShots, setSelectedShots] = useState([]);
  const [changesMade, setChangesMade] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const { addAlbumToCache } = useCameraAlbums();
  const {
    initializeCameraRollCache,
    shots: cameraRollShots,
    isCameraRollCacheInitialized,
  } = useCameraRoll();

  useEffect(() => {
    const initializeCache = async () => {
      if (!isCameraRollCacheInitialized) {
        await initializeCameraRollCache();
      }
    };
    initializeCache();
  }, [initializeCameraRollCache, isCameraRollCacheInitialized]);

  useEffect(() => {
    setChangesMade(selectedShots.length > 0);
  }, [selectedShots]);

  const handleCheckboxToggle = (shot) => {
    const isAlreadySelected = selectedShots.some((s) => s.shotId === shot._id);

    if (isAlreadySelected) {
      setSelectedShots((prev) => prev.filter((s) => s.shotId !== shot._id));
    } else {
      setSelectedShots((prev) => [
        ...prev,
        { shotId: shot._id, image: shot.imageThumbnail },
      ]);
    }
  };

  const saveChanges = async () => {
    try {
      if (!selectedShots.length) {
        Alert.alert(
          "Error",
          "Please select at least one shot to create an album."
        );
        return;
      }

      const newAlbumData = {
        title: albumTitle,
        shots: selectedShots.map((shot) => shot.shotId),
        shotsCount: selectedShots.length,
        coverImage: selectedShots[0]?.image,
      };

      const newAlbumId = await addAlbumToCache(newAlbumData);

      // Navigate to ViewAlbum without keeping CreateAlbum in the stack
      if (newAlbumId) {
        navigation.replace("ViewAlbum", {
          albumId: newAlbumId,
          fromScreen: "CreateAlbum",
        });
      } else {
        Alert.alert("Error", "Failed to create album. Please try again.");
      }
    } catch (error) {
      console.error("[CreateAlbum] Error creating album:", error);
      Alert.alert("Error", "An error occurred while creating the album.");
    }
  };

  const handleBackPress = () => {
    if (changesMade) {
      setIsAlertVisible(true);
    } else {
      navigation.goBack();
    }
  };

  const confirmLeave = () => {
    setIsAlertVisible(false);
    navigation.goBack();
  };

  const cancelLeave = () => {
    setIsAlertVisible(false);
  };

  useEffect(() => {
    navigation.setOptions({
      title: albumTitle,
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={handleBackPress}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <Pressable onPress={saveChanges} disabled={!changesMade}>
            <Text
              style={[
                headerStyles.createButtonText,
                changesMade && headerStyles.createButtonTextActive,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      ),
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        backgroundColor: "#121212",
      },
    });
  }, [navigation, albumTitle, changesMade, saveChanges]);

  const renderShot = ({ item }) => (
    <CameraShotSelectCard
      shot={item}
      isSelected={selectedShots.some((s) => s.shotId === item._id)}
      onCheckboxToggle={() => handleCheckboxToggle(item)}
    />
  );

  if (!isCameraRollCacheInitialized) {
    return (
      <View style={containerStyles.loadingContainer}>
        <Text style={containerStyles.loadingText}>Loading Camera Roll...</Text>
      </View>
    );
  }

  return (
    <View style={layoutStyles.wrapper}>
      <DangerAlert
        visible={isAlertVisible}
        onRequestClose={cancelLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
        confirmButtonText="Leave"
        cancelButtonText="Stay"
      />

      <FlatList
        data={cameraRollShots}
        renderItem={renderShot}
        keyExtractor={(item) => item._id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "space-between",
  },
});
