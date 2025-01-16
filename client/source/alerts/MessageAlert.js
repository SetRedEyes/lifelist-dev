import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";

const MessageAlert = ({ message, visible, duration = 3000 }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Handle fade-in and fade-out animation
  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Fade out after the specified duration
      const timeout = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible, duration, opacityAnim]);

  if (!visible) return null;

  return (
    <View style={styles.absolute}>
      <View style={styles.centeredView}>
        <Animated.View style={[styles.alertBox, { opacity: opacityAnim }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  alertBox: {
    backgroundColor: "#252525",
    padding: 10,
    borderRadius: 8,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

export default MessageAlert;
