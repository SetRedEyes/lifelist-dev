import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { auth } from "../../utils/firebaseConfig"; // Ensure correct Firebase import
import { formStyles } from "../../styles/components/formStyles";
import authenticationStyles from "../../styles/screens/authenticationStyles";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";
import { VALIDATE_PHONE_NUMBER } from "../../utils/mutations/userAuthenticationMutations";
import { useMutation } from "@apollo/client";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import AuthService from "../../utils/AuthService";

export default function SignUp() {
  const { resetProfile } = useCreateProfileContext();
  const [isValid, setIsValid] = useState(false);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigation = useNavigation();
  const recaptchaVerifier = useRef(null); // Ref for the reCAPTCHA modal

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

  // Handle sending the phone verification code
  const handleNextStep = async () => {
    try {
      const cleanedPhoneNumber = formattedPhoneNumber.replace(/\D/g, "");

      // Step 1: Check if the phone number already exists in the database
      const { data } = await validatePhoneNumber({
        variables: { phoneNumber: cleanedPhoneNumber },
      });

      if (data.validatePhoneNumber.exists) {
        Alert.alert("Error", "This phone number is already in use.");
        return;
      }

      // Step 2: Send the verification code via Firebase Auth
      const fullPhoneNumber = `+1${cleanedPhoneNumber}`;

      const confirmation = await AuthService.sendVerificationCode(
        fullPhoneNumber,
        recaptchaVerifier.current // Pass the reCAPTCHA verifier
      );

      // Save the confirmation result in the state
      setConfirmationResult(confirmation);

      // Navigate to the VerifyAccount screen with the confirmation result
      navigation.navigate("VerifyAccount", {
        confirmationResult: confirmation,
      });
    } catch (error) {
      if (error.code === "auth/invalid-phone-number") {
        Alert.alert(
          "Invalid Phone Number",
          "Please enter a valid phone number."
        );
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
      console.error("Error:", error);
    }
  };

  return (
    <Pressable style={authenticationStyles.wrapper} onPress={Keyboard.dismiss}>
      {/* reCAPTCHA Verifier Modal */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />

      <View style={authenticationStyles.container}>
        <View style={authenticationStyles.logoContainer}>
          <Image
            source={require("../../../assets/branding/lifelist-icon.png")}
            style={authenticationStyles.mainLogo}
          />
        </View>
        <Text style={authenticationStyles.title}>Sign Up for Lifelist</Text>
        <Text style={authenticationStyles.mainSubtitle}>
          Please enter your phone number to receive a verification code.
        </Text>

        {/* Phone Number Input */}
        <View style={authenticationStyles.inputWrapper}>
          <View style={formStyles.inputHeader}>
            <Text style={formStyles.label}>Phone Number</Text>
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
          onPress={isValid ? handleNextStep : null}
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
