import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import CameraShotBlurredCard from "../../cards/camera/CameraShotBlurredCard";
import { useDevelopingRoll } from "../../contexts/DevelopingRollContext";
import { containerStyles, layoutStyles } from "../../styles/components";
import { BlurView } from "expo-blur";
import DevelopingDisplay from "../../displays/DevelopingDisplay";

export default function DevelopingRoll() {
  const [selectedShot, setSelectedShot] = useState(null);

  const {
    developingShots,
    recalculateDevelopedStatus,
    updateShot,
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

  const handleShotPress = (shot) => {
    if (shot.isDeveloped) {
      setSelectedShot(shot);
    }
  };

  const closeDevelopedShot = () => {
    setSelectedShot(null);
  };

  const handleShotDeveloped = (shotId) => {
    updateShot(shotId, { isDeveloped: true });
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

  console.log(developingShots);

  return (
    <View style={layoutStyles.wrapper}>
      {developingShots.length > 0 ? (
        <FlatList
          data={developingShots}
          renderItem={({ item }) => (
            <CameraShotBlurredCard
              shot={item}
              onShotDeveloped={handleShotDeveloped}
              onPress={() => handleShotPress(item)}
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

      {selectedShot && (
        <BlurView intensity={25} style={StyleSheet.absoluteFill}>
          <DevelopingDisplay
            shotId={selectedShot._id}
            onClose={closeDevelopedShot}
            shot={selectedShot}
          />
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "space-between",
  },
});
