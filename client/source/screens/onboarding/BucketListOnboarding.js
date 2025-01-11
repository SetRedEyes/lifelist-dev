import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { Image } from "expo-image"; // Using expo-image for optimized performance
import { LinearGradient } from "expo-linear-gradient"; // Gradient for the blur effect
import AuthenticationButton from "../../buttons/AuthenticationButton";
import { layoutStyles } from "../../styles/components";
import { useNavigation } from "@react-navigation/native";

// Get screen dimensions
const { height: screenHeight } = Dimensions.get("window");

export default function BucketListOnboarding() {
  const navigation = useNavigation();

  // Animation values
  const opacityValue = useRef(new Animated.Value(0)).current;
  const slideUpValue = useRef(new Animated.Value(50)).current;
  const contentOpacityValue = useRef(new Animated.Value(0)).current;

  // State to control the animation flow
  const [isWelcomeAnimationDone, setIsWelcomeAnimationDone] = useState(false);

  // Welcome animation logic
  useEffect(() => {
    // Run the "Welcome to LifeList" animation first
    Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpValue, {
        toValue: -50,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: 500, // Delay the content fade-in until after the Welcome animation
      }),
    ]).start(() => setIsWelcomeAnimationDone(true));
  }, []);

  return (
    <View style={layoutStyles.wrapper}>
      {/* Top Image with Gradient Overlay */}
      {isWelcomeAnimationDone && (
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/onboarding/bucketlist-onboarding.png")}
            style={styles.image}
          />
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.7)", "#121212"]}
            locations={[0, 0.6, 1]}
            style={styles.gradientOverlay}
          />
        </View>
      )}

      {/* Welcome to LifeList Animation */}
      {!isWelcomeAnimationDone && (
        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity: opacityValue,
              transform: [{ translateY: slideUpValue }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Image
            source={require("../../../assets/branding/lifelist-text.png")}
            style={styles.imageText}
          />
        </Animated.View>
      )}

      {/* Main Content */}
      {isWelcomeAnimationDone && (
        <Animated.View
          style={[styles.contentContainer, { opacity: contentOpacityValue }]}
        >
          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Curate your BucketList</Text>
            <Text style={styles.subtitle}>
              Use the built-in bucketlist to track all accomplished experiences
              & future aspirations.
            </Text>
          </View>

          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {[...Array(4)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === 0 && styles.activeDot, // First dot is green
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
            onPress={() => navigation.navigate("CameraOnboarding")}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: screenHeight * 0.65,
    position: "relative",
    marginTop: screenHeight * 0.08,
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
    height: 250,
  },
  welcomeContainer: {
    position: "absolute",
    top: "40%",
    width: "100%",
    alignItems: "center",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  imageText: {
    width: 224,
    height: 53,
    marginTop: 8,
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
