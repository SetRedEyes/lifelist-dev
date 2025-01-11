import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image"; // Using expo-image for optimized performance
import { LinearGradient } from "expo-linear-gradient"; // Gradient for the blur effect
import AuthenticationButton from "../../buttons/AuthenticationButton";
import { layoutStyles } from "../../styles/components";
import { useNavigation } from "@react-navigation/native";

// Get screen dimensions
const { height: screenHeight } = Dimensions.get("window");

export default function ShareOnboarding() {
  const navigation = useNavigation();

  return (
    <View style={layoutStyles.wrapper}>
      {/* Top Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/onboarding/share-onboarding.png")}
          style={styles.image}
        />
        {/* Gradient Overlay */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(0, 0, 0, 0.7)",
            "#121212", // More aggressive fade to black
          ]}
          locations={[0, 0.6, 1]} // Controls where each color stop is placed
          style={styles.gradientOverlay}
        />
      </View>

      <View style={styles.contentContainer}>
        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Share Your Experiences</Text>
          <Text style={styles.subtitle}>
            Connect, inspire, and let your stories make a difference.
          </Text>
        </View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === 2 && styles.activeDot, // Highlight the third dot
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <AuthenticationButton
          backgroundColor={"#6AB95230"}
          borderColor={"#6AB95250"}
          textColor={"#6AB952"}
          width="85%"
          text="Next"
          onPress={() => navigation.navigate("NotificationsOnboarding")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: screenHeight * 0.65,
    position: "relative",
    marginTop: screenHeight * 0.08,
    paddingHorizontal: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 250, // Increased the height for a stronger effect
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 72,
  },
  textContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 32,
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    backgroundColor: "#6AB95230",
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#6AB952",
  },
});
