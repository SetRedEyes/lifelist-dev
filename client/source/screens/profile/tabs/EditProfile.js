import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { formStyles } from "../../../styles/components/formStyles";
import { editProfileStyles } from "../../../styles/screens/editProfileStyles";
import AuthenticationButton from "../../../buttons/AuthenticationButton";

export default function EditProfileTab() {
  const {
    adminProfile,
    updateAdminProfileField,
    saveAdminProfile,
    resetAdminChanges,
    unsavedChanges,
    setProfilePictureUri,
  } = useAdminProfile();

  // === Resize and compress the selected image ===
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

  // === Handle image selection ===
  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to enable permissions to access your camera roll."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;

        // Resize and compress the selected image
        const resizedImageUri = await resizeAndCompressImage(selectedImage);

        // Update the context’s profile picture URI
        setProfilePictureUri(resizedImageUri);

        // Temporarily update the profile picture in the UI
        updateAdminProfileField("profilePicture", resizedImageUri);
      }
    } catch (error) {
      Alert.alert("Image Error", error.message);
      console.error("Error picking image:", error);
    }
  };

  // === Format date for display ===
  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return "Invalid date";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <KeyboardAvoidingView
      style={editProfileStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView
          style={formStyles.formContainer}
          keyboardDismissMode="on-drag"
        >
          <Text style={editProfileStyles.header}>Profile Information</Text>

          {/* Profile Picture */}
          <Pressable
            onPress={pickImage}
            style={[editProfileStyles.profilePictureContainer]}
          >
            <Image
              source={{ uri: adminProfile?.profilePicture }}
              style={editProfileStyles.profilePicture}
              resizeMode="cover"
            />
            <Pressable onPress={pickImage}>
              <Text style={editProfileStyles.changeProfilePictureText}>
                Change Profile Picture
              </Text>
            </Pressable>
          </Pressable>

          {/* Full Name */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Name</Text>
            <TextInput
              value={adminProfile?.fullName || ""}
              onChangeText={(value) =>
                updateAdminProfileField("fullName", value)
              }
              style={formStyles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#d4d4d4"
            />
          </View>

          {/* Username */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Username</Text>
            <TextInput
              value={adminProfile?.username || ""}
              onChangeText={(value) =>
                updateAdminProfileField("username", value)
              }
              style={formStyles.input}
              placeholder="Enter your username"
              placeholderTextColor="#d4d4d4"
            />
          </View>

          {/* Bio */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Bio</Text>
            <TextInput
              value={adminProfile?.bio || ""}
              onChangeText={(value) => updateAdminProfileField("bio", value)}
              style={formStyles.input}
              placeholder="Tell us about yourself"
              placeholderTextColor="#d4d4d4"
              multiline
            />
          </View>

          {/* Gender (Non-editable) */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Gender</Text>
            <TextInput
              value={
                adminProfile?.gender
                  ? adminProfile.gender.charAt(0).toUpperCase() +
                    adminProfile.gender.slice(1).toLowerCase()
                  : "Not specified"
              }
              style={[formStyles.input, { color: "#d4d4d4" }]}
              editable={false}
            />
          </View>

          {/* Birthday (Non-editable) */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Birthday</Text>
            <TextInput
              value={
                adminProfile?.birthday
                  ? formatDate(adminProfile.birthday)
                  : "Not specified"
              }
              style={[formStyles.input, { color: "#d4d4d4" }]}
              editable={false}
            />
          </View>

          {/* Login Button */}
          <AuthenticationButton
            backgroundColor={unsavedChanges ? "#6AB95230" : "#1c1c1c"}
            borderColor={unsavedChanges ? "#6AB95250" : "#1c1c1c"}
            textColor={unsavedChanges ? "#6AB952" : "#696969"}
            width="100%"
            text="Save Changes"
            onPress={unsavedChanges ? saveAdminProfile : null}
            disabled={!unsavedChanges}
          />
          {unsavedChanges && (
            <View
              style={{
                marginTop: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AuthenticationButton
                backgroundColor={"#1c1c1c"}
                borderColor={"#1c1c1c"}
                textColor={"#696969"}
                width="100%"
                text="Discard Changes"
                onPress={resetAdminChanges}
              />
            </View>
          )}
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
