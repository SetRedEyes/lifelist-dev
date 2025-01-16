import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAddExperiencesContext } from "../../../contexts/AddExperiencesContext";
import { useCameraRoll } from "../../../contexts/CameraRollContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import DangerAlert from "../../../alerts/DangerAlert";

export default function ManageTemporaryShots() {
  const route = useRoute();
  const navigation = useNavigation();
  const { updateLifeListExperience } = useAddExperiencesContext();
  const { shots, loadNextPage, hasNextPage } = useCameraRoll();

  const { experienceId, associatedShots } = route.params;

  const [selectedShots, setSelectedShots] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [title, setTitle] = useState("Manage Shots");

  // Initialize selected shots and title based on associated shots
  useEffect(() => {
    if (associatedShots) {
      setSelectedShots([...associatedShots]);
      setTitle(associatedShots.length === 0 ? "Add Shots" : "Manage Shots");
    }
  }, [associatedShots]);

  // Determine if the shots have been modified
  useEffect(() => {
    setIsModified(
      selectedShots.length !== associatedShots.length ||
        selectedShots.some(
          (shot) =>
            !associatedShots.some((initialShot) => initialShot._id === shot._id)
        )
    );
  }, [selectedShots, associatedShots]);

  // Fetch initial shots when the component loads
  useEffect(() => {
    const fetchInitialShots = async () => {
      try {
        await loadNextPage();
      } catch (error) {
        console.error(
          "[ManageTemporaryShots] Error loading initial shots:",
          error
        );
      }
    };
    fetchInitialShots();
  }, [loadNextPage]);

  // Update navigation options with title and buttons
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
  }, [navigation, title, isModified, selectedShots, experienceId]);

  // Handle the back press and show an alert if there are unsaved changes
  const handleBackPress = () => {
    if (isModified) {
      setIsAlertVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // Save the selected shots and update the context
  const handleSave = async (selectedShots, experienceId) => {
    if (!isModified) return;

    try {
      updateLifeListExperience(experienceId, {
        associatedShots: selectedShots,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update associated shots:", error);
    }
  };

  // Confirm leaving without saving changes
  const handleConfirmLeave = () => {
    setIsAlertVisible(false);
    navigation.goBack();
  };

  // Cancel leaving and close the alert
  const handleCancelLeave = () => {
    setIsAlertVisible(false);
  };

  // Create a prioritized list of shots
  const prioritizedShots = [
    ...associatedShots,
    ...shots.filter((shot) => !associatedShots.some((s) => s._id === shot._id)),
  ];

  // Toggle selection for a shot
  const handleCheckboxToggle = (shotId) => {
    setSelectedShots((prev) => {
      const isAlreadySelected = prev.some((s) => s._id === shotId);
      return isAlreadySelected
        ? prev.filter((s) => s._id !== shotId)
        : [...prev, shots.find((shot) => shot._id === shotId)];
    });
  };

  // Load more shots when the end of the list is reached
  const handleEndReached = () => {
    if (hasNextPage) {
      loadNextPage();
    }
  };

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
