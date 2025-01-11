import React, { useState, useEffect } from "react";
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
import { useMutation } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";
import { LOGIN } from "../../utils/mutations/userAuthenticationMutations";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import { formStyles } from "../../styles/components/formStyles";
import authenticationStyles from "../../styles/screens/authenticationStyles";

export default function Login() {
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState(""); // Phone number state
  const [password, setPassword] = useState(""); // Password state
  const [isValid, setIsValid] = useState(false); // Input validity state
  const navigation = useNavigation(); // Navigation hook
  const { login } = useAuth(); // Auth context

  // Apollo login mutation
  const [loginUser, { loading, error }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      login(data.login.token);
    },
    onError: (err) => {
      Alert.alert("Login Error", err.message);
    },
  });

  // 📱 Phone Number Formatter
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

  // ✅ Validate inputs
  const validateInputs = () => {
    const phoneIsValid = formattedPhoneNumber.replace(/\D/g, "").length === 10;
    const passwordIsValid = password.length >= 6;
    setIsValid(phoneIsValid && passwordIsValid);
  };

  // 📱 Handle login action
  const handleLogin = () => {
    if (!formattedPhoneNumber.trim() || !password.trim()) {
      Alert.alert("Error", "Both fields are required.");
      return;
    }

    const cleanedPhoneNumber = formattedPhoneNumber.replace(/\D/g, ""); // Clean phone number
    loginUser({
      variables: { usernameOrEmailOrPhone: cleanedPhoneNumber, password },
    });
  };

  // Reset fields on screen focus
  useFocusEffect(
    React.useCallback(() => {
      setFormattedPhoneNumber("");
      setPassword("");
    }, [])
  );

  // Run validation when inputs change
  useEffect(() => {
    validateInputs();
  }, [formattedPhoneNumber, password]);

  return (
    <Pressable style={authenticationStyles.wrapper} onPress={Keyboard.dismiss}>
      <View style={authenticationStyles.container}>
        <View style={authenticationStyles.logoContainer}>
          <Image
            source={require("../../../assets/branding/lifelist-icon.png")}
            style={authenticationStyles.mainLogo}
          />
        </View>
        <Text style={authenticationStyles.title}>Welcome Back</Text>
        <Text style={authenticationStyles.mainSubtitle}>
          Please choose your preferred login method.
        </Text>

        {/* Phone Number Input */}
        <View style={authenticationStyles.inputWrapper}>
          <Text style={formStyles.label}>Phone Number</Text>
          <TextInput
            style={formStyles.input}
            value={formattedPhoneNumber}
            placeholder="(xxx) xxx-xxxx"
            placeholderTextColor="#c7c7c7"
            keyboardType="phone-pad"
            onChangeText={handlePhoneChange}
          />
        </View>

        {/* Password Input */}
        <View style={authenticationStyles.inputWrapper}>
          <Text style={formStyles.label}>Password</Text>
          <TextInput
            style={formStyles.input}
            value={password}
            placeholder="Enter your password"
            placeholderTextColor="#c7c7c7"
            keyboardType="default"
            secureTextEntry={true}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        <AuthenticationButton
          backgroundColor={isValid ? "#6AB95230" : "#1c1c1c"}
          borderColor={isValid ? "#6AB95250" : "#1c1c1c"}
          textColor={isValid ? "#6AB952" : "#696969"}
          width="85%"
          text={loading ? "Loading..." : "Log In"}
          onPress={isValid ? handleLogin : null}
          disabled={loading}
        />

        <View style={authenticationStyles.orContainer}>
          <View style={authenticationStyles.leftLine} />
          <Text style={authenticationStyles.orText}>or</Text>
          <View style={authenticationStyles.rightLine} />
        </View>

        {/* Social Media Login Options */}
        <View style={authenticationStyles.socialIconsContainer}>
          <Pressable style={authenticationStyles.socialIcon}>
            <Image
              source={require("../../../assets/logos/google-icon.webp")}
              style={authenticationStyles.googleImage}
            />
            <Text style={authenticationStyles.socialText}>
              Log In with Google{" "}
            </Text>
          </Pressable>
        </View>

        {/* Create Account Link */}
      </View>
      <Pressable onPress={() => navigation.navigate("SignUp")}>
        <View style={authenticationStyles.footerTextContainer}>
          <Text style={authenticationStyles.signInText}>
            Don't have an account?{" "}
            <Text style={authenticationStyles.signInLink}>Sign Up</Text>
          </Text>
        </View>
      </Pressable>
    </Pressable>
  );
}
