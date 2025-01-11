import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCameraRoll } from "../../../contexts/CameraRollContext";
import { useAdminLifeList } from "../../../contexts/AdminLifeListContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import DangerAlert from "../../../alerts/DangerAlert";

export default function ManageAssociatedShots() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    shots,
    loadNextPage,
    initializeCameraRollCache,
    isCameraRollCacheInitialized,
  } = useCameraRoll();
  const { updateLifeListExperienceInCache } = useAdminLifeList();

  const { experienceId, associatedShots } = route.params;

  const [selectedShots, setSelectedShots] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [title, setTitle] = useState("Manage Shots");

  useEffect(() => {
    if (!isCameraRollCacheInitialized) {
      initializeCameraRollCache();
    }
  }, [isCameraRollCacheInitialized, initializeCameraRollCache]);

  useEffect(() => {
    if (associatedShots) {
      setSelectedShots([...associatedShots]);
      setTitle(associatedShots.length === 0 ? "Add Shots" : "Manage Shots");
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
        <View style={styles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={handleBackPress}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => handleSave(selectedShots, experienceId)}
            disabled={!isModified}
          >
            <Text
              style={[
                styles.saveButtonText,
                isModified && styles.saveButtonTextActive,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [
    navigation,
    title,
    isModified,
    selectedShots,
    experienceId,
    handleBackPress,
  ]);

  const handleBackPress = () => {
    if (isModified) {
      setIsAlertVisible(true); // Show alert for unsaved changes
    } else {
      navigation.goBack(); // Navigate back directly if no changes
    }
  };

  const handleSave = async (selectedShots, experienceId) => {
    if (!isModified) return;

    try {
      await updateLifeListExperienceInCache({
        lifeListExperienceId: experienceId,
        associatedShots: selectedShots, // Pass the entire selectedShots array
      });
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update associated shots:", error);
    }
  };

  const handleConfirmLeave = () => {
    setIsAlertVisible(false); // Close alert
    navigation.goBack(); // Navigate back
  };

  const handleCancelLeave = () => {
    setIsAlertVisible(false); // Close alert without leaving
  };

  // Create prioritized data for the FlatList
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
    loadNextPage();
  };

  if (!isCameraRollCacheInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Camera Roll...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
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
      />
      <DangerAlert
        visible={isAlertVisible}
        onRequestClose={handleCancelLeave}
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={handleConfirmLeave}
        confirmButtonText="Leave"
        cancelButtonText="Stay"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginHorizontal: 0,
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
  },
  saveButtonText: {
    fontSize: 12,
    color: "#696969",
    fontWeight: "600",
  },
  saveButtonTextActive: {
    color: "#6AB952",
    fontWeight: "700",
  },
});
