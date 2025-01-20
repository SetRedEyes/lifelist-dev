import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCameraRoll } from "../../../contexts/CameraRollContext";
import { useCameraAlbums } from "../../../contexts/CameraAlbumContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import DangerAlert from "../../../alerts/DangerAlert";
import {
  containerStyles,
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../../styles/components/index";

export default function ManageAlbumShots() {
  const route = useRoute();
  const navigation = useNavigation();
  const { albumId, associatedShots } = route.params;

  const { shots, loadNextPage, hasNextPage } = useCameraRoll();
  const { updateAlbumShotsInCache } = useCameraAlbums();

  const [selectedShots, setSelectedShots] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [title, setTitle] = useState("Manage Album Shots");

  // Run loadNextPage on mount to fetch the initial data
  useEffect(() => {
    const fetchInitialShots = async () => {
      try {
        await loadNextPage();
      } catch (error) {
        console.error("Error loading initial shots:", error);
      }
    };
    fetchInitialShots();
  }, [loadNextPage]);

  useEffect(() => {
    if (associatedShots) {
      setSelectedShots([...associatedShots]);
      setTitle(
        associatedShots.length === 0 ? "Add Shots" : "Manage Album Shots"
      );
    }
  }, [associatedShots]);

  useEffect(() => {
    setIsModified(
      selectedShots.length !== associatedShots.length ||
        selectedShots.some(
          (shot) =>
            !associatedShots.some((initialShot) => initialShot._id === shot._id)
        )
    );
  }, [selectedShots, associatedShots]);

  useEffect(() => {
    navigation.setOptions({
      title,
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
          <Pressable onPress={handleSave} disabled={!isModified}>
            <Text
              style={[
                headerStyles.saveButtonText,
                isModified && headerStyles.saveButtonTextActive,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, title, isModified, selectedShots, handleBackPress]);

  const handleBackPress = () => {
    if (isModified) {
      setIsAlertVisible(true); // Show alert for unsaved changes
    } else {
      navigation.goBack(); // Navigate back directly if no changes
    }
  };

  const handleSave = async () => {
    if (!isModified) return;

    try {
      await updateAlbumShotsInCache(albumId, selectedShots); // Update album shots in cache
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update album shots:", error);
    }
  };

  const handleConfirmLeave = () => {
    setIsAlertVisible(false); // Close alert
    navigation.goBack(); // Navigate back
  };

  const handleCancelLeave = () => {
    setIsAlertVisible(false); // Close alert without leaving
  };

  const prioritizedShots = [
    ...associatedShots,
    ...shots.filter((shot) => !associatedShots.some((s) => s._id === shot._id)),
  ];

  const handleCheckboxToggle = (shotId) => {
    setSelectedShots((prev) => {
      const isAlreadySelected = prev.some((s) => s._id === shotId);
      return isAlreadySelected
        ? prev.filter((s) => s._id !== shotId) // Remove from selected
        : [...prev, shots.find((shot) => shot._id === shotId)]; // Add to selected
    });
  };

  const handleEndReached = () => {
    if (hasNextPage) {
      loadNextPage();
    }
  };

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={prioritizedShots}
        renderItem={({ item }) => (
          <CameraShotSelectCard
            shot={item}
            isSelected={selectedShots.some((s) => s._id === item._id)}
            onCheckboxToggle={handleCheckboxToggle}
            navigation={navigation}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasNextPage && <ActivityIndicator size="small" color="#6AB952" />
        }
        showsVerticalScrollIndicator={false}
      />
      <DangerAlert
        visible={isAlertVisible}
        onRequestClose={handleCancelLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={handleConfirmLeave}
        confirmButtonText="Leave"
        onCancel={handleCancelLeave}
        cancelButtonText="Stay"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "flex-start",
    marginHorizontal: 0,
  },
});
