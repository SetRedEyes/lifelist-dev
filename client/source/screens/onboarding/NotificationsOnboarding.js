import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import { layoutStyles } from "../../styles/components";
import { SymbolView } from "expo-symbols";
import * as Notifications from "expo-notifications";
import { useAuth } from "../../contexts/AuthContext";

const { height: screenHeight } = Dimensions.get("window");

export default function NotificationOnboarding() {
  const { completeOnboarding } = useAuth(); // Use the context method to mark onboarding complete

  // Handle onboarding completion
  const completeOnboardingProcess = async () => {
    try {
      // Mark onboarding as complete
      await completeOnboarding();
    } catch (error) {
      console.error("Error during onboarding completion:", error);
    }
  };

  // Request notification permission and complete onboarding
  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus === "granted") {
          Alert.alert(
            "Notifications Enabled",
            "Thank you for enabling notifications!"
          );
        } else {
          Alert.alert("Permission Denied", "You won't receive notifications.");
        }
      } else {
        Alert.alert(
          "Notifications Already Enabled",
          "You have already enabled notifications."
        );
      }

      // Mark onboarding as complete
      completeOnboardingProcess();
    } catch (error) {
      console.error("Notification Permission Error:", error);
    }
  };

  // Handle "Not Now" button press
  const handleNotNowPress = () => {
    Alert.alert(
      "Are you sure?",
      "You can enable notifications later in settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: completeOnboardingProcess, // Complete onboarding even if they choose not to enable notifications
        },
      ]
    );
  };

  return (
    <View style={layoutStyles.wrapper}>
      <View style={styles.iconContainer}>
        <SymbolView name="bell.fill" tintColor={"#6AB952"} size={160} />
        <LinearGradient
          colors={["transparent", "rgba(0, 0, 0, 0.7)", "#121212"]}
          locations={[0, 0.6, 1]}
          style={styles.gradientOverlay}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Enable Notifications</Text>
          <Text style={styles.subtitle}>
            Notifications allow us to send updates when shots are developed and
            collages are ready to share!
          </Text>
        </View>

        <View style={styles.progressContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === 3 && styles.activeDot]}
            />
          ))}
        </View>

        <AuthenticationButton
          backgroundColor={"#6AB95230"}
          borderColor={"#6AB95250"}
          textColor={"#6AB952"}
          width="85%"
          text="Enable Notifications"
          onPress={requestNotificationPermission}
        />

        <TouchableOpacity onPress={handleNotNowPress}>
          <Text style={styles.notNowText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: "100%",
    height: screenHeight * 0.65,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginTop: screenHeight * 0.08,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
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
  notNowText: {
    color: "#fff",
    marginTop: 16,
    fontWeight: "500",
  },
});
