import React, { useEffect, useState } from "react";
import { Text, View, Pressable, Alert, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import authenticationStyles from "../../styles/screens/authenticationStyles";
import ButtonIcon from "../../icons/ButtonIcon";
import { headerStyles, symbolStyles } from "../../styles/components/index";

export default function SetProfilePicture() {
  const navigation = useNavigation();
  const { profile, updateProfile } = useCreateProfileContext();
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture);

  // Set header options dynamically
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            onPress={handleBackPress}
            style={symbolStyles.backArrow}
            weight="bold"
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="chevron.forward"
            weight="bold"
            tintColor={"#6AB952"}
            style={symbolStyles.backArrow}
            onPress={handleNextStep}
          />
        </View>
      ),
    });
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const resizeAndCompressImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error("Error resizing/compressing image:", error);
      throw error;
    }
  };

  const selectProfilePicture = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "You need to enable permissions to access your camera roll."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      try {
        const resizedImageUri = await resizeAndCompressImage(selectedImage);
        setProfilePicture(resizedImageUri);
        updateProfile("profilePicture", resizedImageUri);
      } catch (error) {
        Alert.alert("Image Error", "Failed to process the selected image.");
      }
    }
  };

  const handleNextStep = () => {
    navigation.navigate("SetPermissions");
  };

  return (
    <View style={authenticationStyles.wrapper}>
      <View style={{ justifyContent: "space-between", flex: 1 }}>
        {/* Middle Section */}
        <View style={styles.contentContainer}>
          <Text style={authenticationStyles.stepTitle}>Step 3</Text>
          <Text style={authenticationStyles.mainTitle}>
            Say Cheddar Cheese!
          </Text>
          <Text style={authenticationStyles.subtitle}>
            Let me see that beautiful smile of yours :)
          </Text>

          <Pressable
            style={authenticationStyles.square}
            onPress={selectProfilePicture}
          >
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={authenticationStyles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={authenticationStyles.placeholderText}>
                Tap to Upload
              </Text>
            )}
          </Pressable>

          <AuthenticationButton
            backgroundColor={profilePicture ? "#6AB95230" : "#1c1c1c"}
            borderColor={profilePicture ? "#6AB95250" : "#1c1c1c"}
            textColor={profilePicture ? "#6AB952" : "#696969"}
            width="74%"
            text={profilePicture ? "Next Step" : "Skip"}
            onPress={handleNextStep}
          />
        </View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === 2 && styles.activeDot, // Highlight the first dot
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
