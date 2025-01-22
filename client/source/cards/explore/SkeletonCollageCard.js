import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

// Calculate dimensions for a 2:3 image ratio
const { width: screenWidth } = Dimensions.get("window");
const spacing = 2;
const collageWidth = (screenWidth - spacing * 4) / 3;
const collageHeight = (collageWidth * 3) / 2;

export default function SkeletonCollageCard() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    width: collageWidth,
    marginRight: spacing,
    marginBottom: spacing,
  },
  skeletonImage: {
    width: collageWidth,
    height: collageHeight,
    backgroundColor: "#252525", // Placeholder color
  },
});
