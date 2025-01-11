import React, { useCallback, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
  Keyboard,
  Pressable,
} from "react-native";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { formStyles } from "../../../styles/components/formStyles";
import { editProfileStyles } from "../../../styles/screens/editProfileStyles";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import DangerAlert from "../../../alerts/DangerAlert";
import { useMutation } from "@apollo/client";
import { UPDATE_PASSWORD } from "../../../utils/mutations/userActionMutations";
import AuthenticationButton from "../../../buttons/AuthenticationButton";

export default function EditContact() {
  const navigation = useNavigation();
  const { adminProfile, resetAdminChanges } = useAdminProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Initialize the updatePassword mutation
  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD, {
    onCompleted: (data) => {
      if (data.updatePassword.success) {
        Alert.alert("Success", "Your password has been updated successfully.");
        handleDiscardChanges(); // Reset the form on success
      } else {
        Alert.alert("Error", data.updatePassword.message);
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Handle form modification tracking
  useEffect(() => {
    if (currentPassword && newPassword && confirmNewPassword) {
      setIsModified(true);
    } else {
      setIsModified(false);
    }
  }, [currentPassword, newPassword, confirmNewPassword]);

  // Handle back press logic
  const handleBackPress = () => {
    if (isModified) {
      setShowAlert(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const handleBeforeRemove = (e) => {
        if (!isModified) return;
        e.preventDefault();
        setShowAlert(true);
      };

      navigation.addListener("beforeRemove", handleBeforeRemove);
      return () => {
        navigation.removeListener("beforeRemove", handleBeforeRemove);
      };
    }, [isModified, navigation])
  );

  // Handle password update
  const handleSaveChanges = () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return;
    }

    if (!newPassword || !currentPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    updatePassword({
      variables: {
        currentPassword,
        newPassword,
      },
    });
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    resetAdminChanges();
  };

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";

    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;

    return phoneNumber;
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
          <Text style={editProfileStyles.header}>Contact Information</Text>

          {/* Email */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Email</Text>
            <TextInput
              value={adminProfile?.email || ""}
              editable={!adminProfile?.email}
              style={[formStyles.input, formStyles.disabledInput]}
              placeholder="Enter your email"
              placeholderTextColor="#d4d4d4"
            />
          </View>

          {/* Phone */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Phone</Text>
            <TextInput
              value={
                adminProfile?.phoneNumber
                  ? formatPhoneNumber(adminProfile.phoneNumber)
                  : ""
              }
              editable={!adminProfile?.phoneNumber}
              style={[formStyles.input, formStyles.disabledInput]}
              placeholder="Enter your phone number"
              placeholderTextColor="#d4d4d4"
            />
          </View>

          <Text style={[editProfileStyles.header, { marginTop: 16 }]}>
            Change Password
          </Text>

          {/* Current Password */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Current Password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={formStyles.input}
              placeholder="Enter your current password"
              placeholderTextColor="#d4d4d4"
              secureTextEntry
            />
          </View>

          {/* New Password */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>New Password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              style={formStyles.input}
              placeholder="Enter your new password"
              placeholderTextColor="#d4d4d4"
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View style={formStyles.inputWrapper}>
            <Text style={formStyles.label}>Confirm Password</Text>
            <TextInput
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              style={formStyles.input}
              placeholder="Confirm your new password"
              placeholderTextColor="#d4d4d4"
              secureTextEntry
            />
          </View>

          {/* Update Password Button */}
          <AuthenticationButton
            backgroundColor={isModified ? "#6AB95230" : "#1c1c1c"}
            borderColor={isModified ? "#6AB95250" : "#1c1c1c"}
            textColor={isModified ? "#6AB952" : "#696969"}
            width="100%"
            text="Update Password"
            onPress={isModified ? handleSaveChanges : null}
            disabled={!isModified || loading}
          />

          {/* Discard Changes Button */}
          {isModified && (
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
                onPress={handleDiscardChanges}
              />
            </View>
          )}
        </ScrollView>
      </Pressable>

      {/* Danger Alert */}
      <DangerAlert
        visible={showAlert}
        onRequestClose={() => setShowAlert(false)}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={() => {
          handleDiscardChanges();
          navigation.goBack();
        }}
        onCancel={() => setShowAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}
