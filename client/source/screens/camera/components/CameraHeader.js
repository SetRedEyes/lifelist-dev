import React, { useEffect, useRef, useState } from "react";
import { Text, Animated, Pressable, StyleSheet } from "react-native";
import Icon from "../../../icons/Icon";
import { symbolStyles } from "../../../styles/components/symbolStyles";

export default function CameraHeader({
  cameraType,
  handleShowCameraOptions,
  showCameraOptions,
}) {
  const rotateArrowAnim = useRef(new Animated.Value(0)).current;

  // Rotate the arrow based on the `showCameraOptions` state
  useEffect(() => {
    Animated.timing(rotateArrowAnim, {
      toValue: showCameraOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCameraOptions]);

  const rotateArrow = rotateArrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"], // Rotate when visible
  });

  return (
    <Pressable onPress={handleShowCameraOptions} style={styles.titlePressable}>
      <Text style={styles.header} numberOfLines={1} ellipsizeMode="tail">
        {cameraType}
      </Text>
      <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
        <Icon
          name="chevron.down"
          weight="medium"
          style={symbolStyles.downArrow}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titlePressable: {
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    fontWeight: "700",
    color: "#ffffff",
    fontSize: 16,
  },
});
