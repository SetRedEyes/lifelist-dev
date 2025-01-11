import React, { useState, useEffect } from "react";
import { Text, View, Pressable, Alert, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useCameraPermissions } from "expo-camera";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import Icon from "../../icons/ButtonIcon";
import { useAuth } from "../../contexts/AuthContext";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_PROFILE } from "../../utils/mutations/userAuthenticationMutations";
import authenticationStyles from "../../styles/screens/authenticationStyles";
import ButtonIcon from "../../icons/ButtonIcon";
import { GET_PRESIGNED_URL } from "../../utils/queries/cameraQueries";
import { headerStyles, symbolStyles } from "../../styles/components/index";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SetPermissions() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const { profile } = useCreateProfileContext();
  const [createProfile] = useMutation(CREATE_PROFILE);
  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraPermissionLocked, setCameraPermissionLocked] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
            weight="bold"
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <Pressable onPress={handleCreateProfile} disabled={!isValid}>
            <Text
              style={[
                headerStyles.saveButtonText,
                isValid && headerStyles.saveButtonTextActive,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, isValid, handleCreateProfile]);

  const checkPermissions = async () => {
    const { status } = await cameraPermission.get();
    setIsValid(status === "granted");
    setCameraPermissionLocked(status === "granted");
  };

  const requestPermissionHandler = async () => {
    const { status } = await requestCameraPermission();

    if (status === "denied") {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permissions in your device settings to proceed.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }

    setIsValid(status === "granted");
    setCameraPermissionLocked(status === "granted");
  };

  const handleCreateProfile = async () => {
    if (!isValid) {
      Alert.alert("Permissions Required", "Camera access is required.");
      return;
    }

    let profilePictureUrl = null;

    try {
      if (profile.profilePicture) {
        const fileName = profile.profilePicture.split("/").pop();

        const { data } = await getPresignedUrl({
          variables: {
            folder: "profile-images",
            fileName,
            fileType: "image/jpeg",
          },
        });

        const { presignedUrl, fileUrl } = data.getPresignedUrl;

        const response = await fetch(profile.profilePicture);
        if (!response.ok) throw new Error("Failed to fetch profile picture.");

        const blob = await response.blob();

        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        if (!uploadResponse.ok)
          throw new Error("Failed to upload image to S3.");

        profilePictureUrl = fileUrl;
      }

      const { data } = await createProfile({
        variables: {
          input: {
            ...profile,
            profilePicture: profilePictureUrl,
          },
        },
      });

      const { token } = data.createProfile;
      await login(token);

      // Store the onboarding status in AsyncStorage as false
      await AsyncStorage.setItem("onboardingCompleted", "false");

      // Navigate to the Onboarding flow
      navigation.navigate("BucketListOnboarding");
    } catch (error) {
      Alert.alert("Error", "Failed to create profile. Please try again.");
      console.error("Create Profile Error:", error.message);
    }
  };

  return (
    <View style={authenticationStyles.wrapper}>
      <View style={styles.wrapper}>
        {/* Middle Section */}
        <View style={styles.contentContainer}>
          <Text style={authenticationStyles.stepTitle}>Step 4</Text>
          <Text style={authenticationStyles.mainTitle}>
            Don't forget your Camera!
          </Text>
          <Text style={authenticationStyles.subtitle}>
            Grant camera access to take pictures and capture moments.
          </Text>

          {/* Permissions Container */}
          <View style={{ width: "85%", marginBottom: 16 }}>
            <Pressable
              style={[
                authenticationStyles.permissionBox,
                cameraPermissionLocked && { backgroundColor: "#25252550" },
              ]}
              onPress={
                !cameraPermissionLocked ? requestPermissionHandler : null
              }
            >
              <Icon
                name="camera"
                tintColor={"#fff"}
                style={symbolStyles.cameraIcon}
                noFill={true}
              />
              <View style={authenticationStyles.permissionTextContainer}>
                <Text style={authenticationStyles.permissionTitle}>
                  Enable Camera Access
                </Text>
                <Text style={authenticationStyles.permissionSubtitle}>
                  Tap here to grant access to your camera.
                </Text>
              </View>
            </Pressable>
          </View>

          <AuthenticationButton
            backgroundColor={isValid ? "#6AB95230" : "#1c1c1c"}
            borderColor={isValid ? "#6AB95250" : "#1c1c1c"}
            textColor={isValid ? "#6AB952" : "#696969"}
            width="85%"
            text="Create Profile"
            onPress={handleCreateProfile}
          />
        </View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === 3 && styles.activeDot, // Highlight the first dot
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  contentContainer: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 64,
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
