import React from "react";
import { View, StyleSheet } from "react-native";

export default function SkeletonProfileCard() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Skeleton for the profile image */}
      <View style={styles.skeletonImage} />

      {/* Skeleton for the text */}
      <View style={styles.skeletonTextContainer}>
        <View style={styles.skeletonPrimaryText} />
        <View style={styles.skeletonSecondaryText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    paddingRight: 16,
    marginTop: 4,
    marginRight: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonImage: {
    height: 48, // Matches imageMd
    width: 48,
    borderRadius: 4,
    backgroundColor: "#252525", // Matches fallback background color
  },
  skeletonTextContainer: {
    flex: 1,
    marginLeft: 12, // Matches textContainer
  },
  skeletonPrimaryText: {
    width: 80, // Placeholder width for the primary text
    height: 14, // Matches primaryText font size
    borderRadius: 4,
    backgroundColor: "#252525", // Placeholder background color
    marginBottom: 6,
  },
  skeletonSecondaryText: {
    width: "60", // Placeholder width for the secondary text
    height: 12, // Matches secondaryText font size
    borderRadius: 4,
    backgroundColor: "#252525", // Placeholder background color
  },
});
