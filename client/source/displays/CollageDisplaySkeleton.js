import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { symbolStyles } from "../styles/components/symbolStyles";

const { width } = Dimensions.get("window");

export default function CollageDisplaySkeleton() {
  return (
    <View style={styles.wrapper}>
      {/* Image Placeholder */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.actionContainer}>
          <View style={[symbolStyles.like, styles.actionPlaceholder]} />
          <View style={[symbolStyles.repost, styles.actionPlaceholder]} />
          <View style={[symbolStyles.comment, styles.actionPlaceholder]} />
          <View style={[symbolStyles.ellipsis, styles.actionPlaceholder]} />
        </View>
      </View>

      {/* Caption Placeholder */}
      <View style={styles.bottomContainer}>
        <View style={styles.captionContainer}>
          <View style={styles.smallProfilePicturePlaceholder} />
          <View style={styles.captionPlaceholder} />
        </View>
        <View style={styles.bottomTextContainer}>
          <View style={styles.buttonPlaceholder} />
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.buttonPlaceholder, { marginLeft: 8 }]} />
            <View style={[styles.buttonPlaceholder, { marginLeft: 8 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  imagePlaceholder: {
    width: width,
    height: width * (3 / 2),
    backgroundColor: "#252525",
  },
  actionContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "column",
    alignItems: "center",
  },
  actionPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: "#3a3a3a",
    borderRadius: 12,
    marginBottom: 12,
  },
  bottomContainer: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  captionPlaceholder: {
    height: 14,
    backgroundColor: "#3a3a3a",
    flex: 1,
    borderRadius: 4,
  },
  smallProfilePicturePlaceholder: {
    height: 35,
    width: 35,
    borderRadius: 4,
    backgroundColor: "#3a3a3a",
    marginRight: 8,
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonPlaceholder: {
    width: 80,
    height: 24,
    backgroundColor: "#3a3a3a",
    borderRadius: 12,
  },
});
