import React, { useEffect, useState, createRef } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ButtonIcon from "../../icons/ButtonIcon";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import {
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../styles/components/index";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";

export default function VerifyAccount() {
  const { profile, updateProfile } = useCreateProfileContext();
  const navigation = useNavigation();
  const route = useRoute(); // Get the navigation params
  const { confirmationResult } = route.params; // Destructure confirmationResult
  const codeLength = 6;
  const inputs = Array(codeLength)
    .fill(0)
    .map(() => createRef());
  const [code, setCode] = useState(Array(codeLength).fill(""));
  const isValid = !code.includes("");

  // Handle Code Input
  const handleCodeInput = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < codeLength - 1) {
      inputs[index + 1].current.focus();
    } else if (!text && index > 0) {
      inputs[index - 1].current.focus();
    }
  };

  // Verify the code and update the profile
  const handleVerification = async () => {
    try {
      const verificationCode = code.join(""); // Combine the code digits

      // Confirm the code using Firebase Auth
      await confirmationResult.confirm(verificationCode);

      // Update the phone number in the profile
      updateProfile("phoneNumber", profile.phoneNumber);

      // Navigate to the next screen
      navigation.navigate("SetLoginInformation");
      Alert.alert("Success", "Your phone number has been verified!");
    } catch (error) {
      Alert.alert("Error", "Invalid verification code. Please try again.");
      console.error("Verification Error:", error);
    }
  };

  // Configure Header
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
          <Pressable
            onPress={() => {
              if (isValid) {
                handleVerification();
              } else {
                Alert.alert("Error", "Please enter the full 6-digit code.");
              }
            }}
            disabled={!isValid}
          >
            <Text
              style={[
                headerStyles.saveButtonText,
                isValid && headerStyles.saveButtonTextActive,
              ]}
            >
              Verify
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, isValid]);

  return (
    <Pressable style={layoutStyles.wrapper} onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Image
          source={require("../../../assets/branding/lifelist-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.header}>Verify Account</Text>
        <Text style={styles.smallText}>
          We sent you a 6-digit code to {profile?.phoneNumber}. Enter the code
          below to confirm your phone number.
        </Text>
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputs[index]}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeInput(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        <AuthenticationButton
          backgroundColor={isValid ? "#6AB95230" : "#1c1c1c"}
          borderColor={isValid ? "#6AB95250" : "#1c1c1c"}
          textColor={isValid ? "#6AB952" : "#696969"}
          width="85%"
          text={isValid ? "Verify Phone Number" : "Enter Code"}
          onPress={isValid ? handleVerification : null}
        />
      </View>

      {/* Resend Verification */}
      <View style={styles.footerTextContainer}>
        <Text style={styles.smallText}>Didn’t receive our code?</Text>
        <Pressable onPress={() => Alert.alert("Verification Code Resent")}>
          <Text style={[styles.smallText, styles.resendText]}>
            Resend Verification
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 164,
  },
  logo: {
    width: 84,
    height: 84,
  },
  header: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 16,
    color: "#fff",
  },
  smallText: {
    marginTop: 8,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    width: "85%",
    marginBottom: 16,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#121212",
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    backgroundColor: "#252525",
  },
  resendText: {
    marginTop: 6,
    color: "#6AB952",
    fontWeight: "600",
  },
  footerTextContainer: {
    position: "absolute",
    bottom: 75,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
