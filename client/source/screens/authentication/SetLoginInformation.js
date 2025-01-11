import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Alert,
  Pressable,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DangerAlert from "../../alerts/DangerAlert";
import { useMutation } from "@apollo/client";
import { VALIDATE_USERNAME_AND_PASSWORD } from "../../utils/mutations";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import authenticationStyles from "../../styles/screens/authenticationStyles";
import ButtonIcon from "../../icons/ButtonIcon";
import {
  headerStyles,
  symbolStyles,
  formStyles,
} from "../../styles/components/index";

export default function SetLoginInformation() {
  const { profile, updateProfile, resetProfile } = useCreateProfileContext();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigation = useNavigation();

  const [validateUsernameAndPassword] = useMutation(
    VALIDATE_USERNAME_AND_PASSWORD
  );

  useEffect(() => {
    validateForm();
  }, [profile.username, profile.password, confirmPassword]);

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
            tintColor={isValid ? "#6AB952" : "#696969"}
            style={symbolStyles.backArrow}
            onPress={isValid ? handleNextStep : null}
          />
        </View>
      ),
    });
  }, [navigation, isValid]);

  const validateForm = () => {
    const isValidUsername = profile.username.length >= 5;
    const isValidPassword =
      profile.password.length >= 8 && profile.password === confirmPassword;
    setIsValid(isValidUsername && isValidPassword);
  };

  const handleNextStep = async () => {
    if (!isValid) return;

    try {
      const { data } = await validateUsernameAndPassword({
        variables: {
          username: profile.username,
          password: profile.password,
        },
      });

      if (!data.validateUsernameAndPassword.success) {
        Alert.alert(
          "Validation Error",
          data.validateUsernameAndPassword.message
        );
        return;
      }

      navigation.navigate("SetProfileInformation");
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      console.error("Error validating username and password:", error);
    }
  };

  const handleBackPress = () => {
    setShowAlert(true);
  };

  const handleConfirmBackPress = () => {
    setShowAlert(false);
    navigation.navigate("SignUp");
    resetProfile();
  };

  return (
    <Pressable
      style={authenticationStyles.wrapper}
      onPress={() => Keyboard.dismiss()}
    >
      <View style={styles.wrapper}>
        {/* Form Content */}
        <View style={styles.contentContainer}>
          <Text style={authenticationStyles.stepTitle}>Step 1</Text>
          <Text style={authenticationStyles.mainTitle}>Login Information</Text>
          <Text style={authenticationStyles.subtitle}>
            Create a unique username and password to set up your account.
          </Text>

          {/* Username Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Username</Text>
            <TextInput
              style={formStyles.input}
              value={profile.username}
              placeholder="Enter your username"
              placeholderTextColor="#c7c7c7"
              onChangeText={(value) => updateProfile("username", value)}
              autoComplete="off"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Password</Text>
            <TextInput
              style={formStyles.input}
              value={profile.password}
              placeholder="Enter your password"
              placeholderTextColor="#c7c7c7"
              secureTextEntry={!isPasswordVisible}
              onChangeText={(value) => updateProfile("password", value)}
              autoComplete="off"
              autoCapitalize="none"
            />
          </View>

          {/* Confirm Password Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Confirm Password</Text>
            <TextInput
              style={formStyles.input}
              value={confirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#c7c7c7"
              secureTextEntry={!isConfirmPasswordVisible}
              onChangeText={(value) => setConfirmPassword(value)}
              autoComplete="off"
              autoCapitalize="none"
            />
          </View>

          {/* Next Step Button */}
          <AuthenticationButton
            backgroundColor={isValid ? "#6AB95230" : "#1c1c1c"}
            borderColor={isValid ? "#6AB95250" : "#1c1c1c"}
            textColor={isValid ? "#6AB952" : "#696969"}
            width="85%"
            text="Next Step"
            onPress={isValid ? handleNextStep : null}
          />
        </View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === 0 && styles.activeDot, // Highlight the first dot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Danger Alert */}
      <DangerAlert
        visible={showAlert}
        onRequestClose={() => setShowAlert(false)}
        title="Progress will be lost"
        message="If you go back, all your progress will be lost. Do you want to continue?"
        onConfirm={handleConfirmBackPress}
        onCancel={() => setShowAlert(false)}
        confirmButtonText="Leave"
        cancelButtonText="Discard"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "space-between",
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
