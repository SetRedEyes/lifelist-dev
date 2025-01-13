import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formStyles } from "../../styles/components/formStyles";
import authenticationStyles from "../../styles/screens/authenticationStyles";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";
import { VALIDATE_PHONE_NUMBER } from "../../utils/mutations/userAuthenticationMutations";
import { useMutation } from "@apollo/client";

import AuthenticationButton from "../../buttons/AuthenticationButton";

export default function SignUp() {
  const { profile, updateProfile, resetProfile } = useCreateProfileContext();
  const [isValid, setIsValid] = useState(false);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const navigation = useNavigation();

  // Mutation to validate phone number
  const [validatePhoneNumber, { loading }] = useMutation(VALIDATE_PHONE_NUMBER);

  // Phone Number Formatter
  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, ""); // Remove non-digit characters
    let formatted = cleaned;
    if (cleaned.length > 0) {
      formatted = `(${cleaned.substring(0, 3)}`;
    }
    if (cleaned.length >= 4) {
      formatted += `) ${cleaned.substring(3, 6)}`;
    }
    if (cleaned.length >= 7) {
      formatted += `-${cleaned.substring(6, 10)}`;
    }
    setFormattedPhoneNumber(formatted);
  };

  // Validate inputs
  const validateInputs = () => {
    const phoneIsValid = formattedPhoneNumber.replace(/\D/g, "").length === 10;
    setIsValid(phoneIsValid);
  };

  // Reset fields on screen focus
  useFocusEffect(
    useCallback(() => {
      resetProfile();
    }, [])
  );

  // Validate when inputs change
  useEffect(() => {
    validateInputs();
  }, [formattedPhoneNumber]);

  // Handle Send OTP with backend validation
  const handleSendOtp = async () => {
    if (!isValid) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return;
    }

    try {
      // Step 1: Check if the phone number is already taken
      const { data } = await validatePhoneNumber({
        variables: { phoneNumber },
      });

      if (data.validatePhoneNumber.success) {
        Alert.alert("Phone Number Taken", data.validatePhoneNumber.message);
        return;
      }

      // Step 2: Proceed with sending OTP using Firebase
      setupRecaptcha();
      setLoadingOtp(true);
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;

      Alert.alert("Success", "OTP sent!");
      navigation.navigate("VerifyAccount", { phoneNumber });
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    // Wrapping the entire screen in a Pressable to dismiss the keyboard
    <Pressable style={authenticationStyles.wrapper} onPress={Keyboard.dismiss}>
      <View style={authenticationStyles.container}>
        <View style={authenticationStyles.logoContainer}>
          <Image
            source={require("../../../assets/branding/lifelist-icon.png")}
            style={authenticationStyles.mainLogo}
          />
        </View>
        <Text style={authenticationStyles.title}>Sign Up for Lifelist</Text>
        <Text style={authenticationStyles.mainSubtitle}>
          Please choose your preferred sign-up method.
        </Text>

        {/* Phone Number Input */}
        <View style={authenticationStyles.inputWrapper}>
          <View style={formStyles.inputHeader}>
            <Text style={formStyles.label}>{"Phone Number"}</Text>
          </View>
          <TextInput
            style={formStyles.input}
            value={formattedPhoneNumber}
            placeholder={"(xxx) xxx-xxxx"}
            placeholderTextColor="#c7c7c7"
            keyboardType={"phone-pad"}
            onChangeText={handlePhoneChange}
          />
        </View>

        {/* Authentication Button */}
        <AuthenticationButton
          backgroundColor={isValid ? "#6AB95230" : "#1c1c1c"}
          borderColor={isValid ? "#6AB95250" : "#1c1c1c"}
          textColor={isValid ? "#6AB952" : "#696969"}
          width="85%"
          text={loading ? "Loading..." : "Create Account"}
          onPress={isValid && !loading ? handleNextStep : null}
        />
      </View>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <View style={authenticationStyles.footerTextContainer}>
          <Text style={authenticationStyles.signInText}>
            Already have an account?{" "}
            <Text style={authenticationStyles.signInLink}>Sign In</Text>
          </Text>
        </View>
      </Pressable>
    </Pressable>
  );
}

{
  /* <View style={authenticationStyles.orContainer}>
          <View style={authenticationStyles.leftLine} />
          <Text style={authenticationStyles.orText}>or</Text>
          <View style={authenticationStyles.rightLine} />
        </View> */
}

{
  /* <View style={authenticationStyles.socialIconsContainer}>
          <Pressable style={authenticationStyles.socialIcon}>
            <Image
              source={require("../../../assets/logos/google-icon.webp")}
              style={authenticationStyles.googleImage}
            />
            <Text style={authenticationStyles.socialText}>
              Sign Up with Google{" "}
            </Text>
          </Pressable>
        </View> */
}
