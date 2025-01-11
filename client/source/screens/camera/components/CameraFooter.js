import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import FlashOutlineIcon from "../../../icons/camera/FlashOutlineIcon";
import FlashSolidIcon from "../../../icons/camera/FlashSolidIcon";
import FlipCameraIcon from "../../../icons/camera/FlipCameraIcon";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";

export default function CameraFooter({
  handleTakePhoto,
  flash,
  toggleFlash,
  toggleFacing,
}) {
  const navigation = useNavigation();

  const navigateToCameraRoll = () => {
    navigation.navigate("CameraRoll");
  };

  const navigateToDevelopingRoll = () => {
    navigation.navigate("DevelopingRoll");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Pressable onPress={toggleFlash} style={styles.rowIcon}>
          {flash === "off" ? <FlashOutlineIcon /> : <FlashSolidIcon />}
        </Pressable>
        <View style={styles.zoomContainer}>
          <Pressable style={[styles.zoomButton]}>
            <Text style={[styles.zoomText]}>1x</Text>
          </Pressable>
        </View>
        <Pressable onPress={toggleFacing} style={styles.rowIcon}>
          <FlipCameraIcon onPress={toggleFacing} />
        </Pressable>
      </View>
      <View style={styles.container}>
        <Pressable onPress={navigateToCameraRoll} style={styles.iconContainer}>
          <ButtonIcon
            name="photo"
            style={symbolStyles.photoGallery}
            tintColor="#fff"
            onPress={navigateToCameraRoll}
            size="extralarge"
          />
        </Pressable>
        <View style={styles.circleContainer}>
          <Pressable onPress={handleTakePhoto}>
            <LinearGradient
              colors={["#6AB952", "#5FC4ED"]}
              style={styles.circleOutline}
            >
              <View style={styles.circle} />
            </LinearGradient>
          </Pressable>
        </View>
        <Pressable
          onPress={navigateToDevelopingRoll}
          style={styles.iconContainer}
        >
          <ButtonIcon
            name="film"
            style={[symbolStyles.inDevelopment]}
            tintColor="#fff"
            onPress={navigateToDevelopingRoll}
            size="extralarge"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#121212",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#1C1C1C",
    borderRadius: 50,
    paddingVertical: 1,
    marginTop: 8,
    marginBottom: 32,
    width: "60%",
    height: 35,
  },
  zoomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the zoom buttons
    borderRadius: 25,
    paddingHorizontal: 8,
  },
  zoomButton: {
    padding: 10,
    alignItems: "center", // Center text within button
    justifyContent: "center", // Center text within button
  },
  activeZoomButton: {
    backgroundColor: "#6AB95230",
    borderRadius: 25,
  },
  zoomText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center", // Ensure text is centered
  },
  activeZoomText: {
    fontWeight: "bold",
  },
  rowIcon: {
    alignItems: "center",
    justifyContent: "center", // Center icon vertically and horizontally
    width: 45,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 1,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center", // Center icons vertically and horizontally
    width: 75,
  },
  circleContainer: {
    justifyContent: "center", // Center circle vertically
    alignItems: "center", // Center circle horizontally
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circleOutline: {
    width: 72,
    height: 72,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center", // Center circle content
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#ececec",
  },
});
