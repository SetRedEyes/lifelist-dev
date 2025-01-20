import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CameraShotBlurredCard from "../../cards/camera/CameraShotBlurredCard";
import { useDevelopingRoll } from "../../contexts/DevelopingRollContext";
import { containerStyles, layoutStyles } from "../../styles/components";

export default function DevelopingRoll() {
  const navigation = useNavigation();

  const {
    developingShots,
    recalculateDevelopedStatus,
    updateShot, // RESTORED updateShot function
    removeShot, // Function to remove a shot from the roll
    incrementShotsLeft, // Function to increment shotsLeft
    shotsLeft, // Access shotsLeft from context
    initializeDevelopingRoll,
    isDevelopingRollCacheInitialized,
  } = useDevelopingRoll();

  // Ensure the developing roll cache is initialized
  useEffect(() => {
    if (!isDevelopingRollCacheInitialized) {
      initializeDevelopingRoll();
    }
  }, [isDevelopingRollCacheInitialized, initializeDevelopingRoll]);

  // Recalculate developed status whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      recalculateDevelopedStatus();
    }, [recalculateDevelopedStatus])
  );

  // Handle retake functionality
  const handleRetakeShot = async (shotId) => {
    try {
      // Remove the shot as a retake
      await removeShot(shotId, true);

      Alert.alert(
        "Retake Ready",
        "The shot has been removed, and a shot was added!"
      );
    } catch (error) {
      console.error("Error during retake:", error);
      Alert.alert("Error", "Failed to retake the shot. Please try again.");
    }
  };

  // Handle shot press: Navigate to DevelopingDisplay screen
  const handleShotPress = (shot) => {
    if (shot.isDeveloped) {
      navigation.navigate("DevelopingDisplay", { shot });
    }
  };

  // Handle shot developed action
  const handleShotDeveloped = (shotId) => {
    updateShot(shotId, { isDeveloped: true }); // Marks the shot as developed
  };

  if (!isDevelopingRollCacheInitialized) {
    return (
      <View style={containerStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6AB952" />
        <Text style={containerStyles.loadingText}>
          Loading developing shots...
        </Text>
      </View>
    );
  }

  return (
    <View style={layoutStyles.wrapper}>
      {developingShots.length > 0 ? (
        <FlatList
          data={developingShots}
          renderItem={({ item }) => (
            <CameraShotBlurredCard
              shot={item}
              onShotDeveloped={handleShotDeveloped} // Ensure developed status is handled
              onRetake={() => handleRetakeShot(item._id)} // Pass retake functionality
              onPress={() => handleShotPress(item)} // Navigate on press
            />
          )}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={containerStyles.emptyContainer}>
          <Text style={containerStyles.emptyText}>
            No developing shots found.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "space-between",
  },
});
