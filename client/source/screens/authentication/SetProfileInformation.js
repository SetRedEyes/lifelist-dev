import React, { useEffect, useRef, useState } from "react";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useCreateProfileContext } from "../../contexts/CreateProfileContext";
import AuthenticationButton from "../../buttons/AuthenticationButton";
import authenticationStyles from "../../styles/screens/authenticationStyles";
import ButtonIcon from "../../icons/ButtonIcon";
import {
  headerStyles,
  symbolStyles,
  formStyles,
} from "../../styles/components/index";

const allowedGenders = ["MALE", "FEMALE", "PREFER NOT TO SAY"];
const fullNameRegex = /^[a-zA-Z\s]+$/;

export const validateFullName = (fullName) => {
  if (!fullNameRegex.test(fullName)) {
    throw new Error(
      "Full name must only contain alphabetic characters and spaces."
    );
  }
  return true;
};

export const validateProfileDetails = ({ fullName, gender }) => {
  validateFullName(fullName);

  if (!allowedGenders.includes(gender)) {
    throw new Error("Invalid gender. Please select a valid option.");
  }

  return true;
};

export default function SetProfileInformation() {
  const { profile, updateProfile } = useCreateProfileContext();
  const [isValid, setIsValid] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const navigation = useNavigation();
  const lastFocusedInputRef = useRef(null);

  // Validate form whenever profile data changes
  useEffect(() => {
    validateForm();
  }, [profile.fullName, profile.gender, profile.birthday]);

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
            tintColor={isValid ? "#6AB952" : "#696969"}
            style={symbolStyles.backArrow}
            onPress={isValid ? handleNextStep : null}
          />
        </View>
      ),
    });
  }, [navigation, isValid]);

  // Date Picker visibility handlers
  const showDatePicker = () => {
    Keyboard.dismiss(); // Dismiss the keyboard before showing the date picker
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    lastFocusedInputRef.current?.blur(); // Ensure no input refocuses
  };

  // Handle date selection with age validation
  const handleConfirm = (date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear(); // Change from const to let
    const monthDifference = today.getMonth() - date.getMonth();

    // Adjust age if the birthday hasn't occurred yet this year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      Alert.alert(
        "Age Restriction",
        "You must be at least 18 years old to use this app."
      );
      return;
    }

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    updateProfile("birthday", formattedDate);
    hideDatePicker();
  };

  // Form validation logic
  const validateForm = () => {
    const { fullName, gender, birthday } = profile;

    const isFullNameValid = fullName && fullNameRegex.test(fullName);
    const isGenderValid =
      gender && allowedGenders.includes(gender.toUpperCase());
    const isBirthdayValid = birthday && birthday.length === 10; // "MM/DD/YYYY" format

    setIsValid(isFullNameValid && isGenderValid && isBirthdayValid);
  };

  // Handle next step navigation
  const handleNextStep = () => {
    try {
      validateProfileDetails({
        fullName: profile.fullName,
        gender: profile.gender,
      });

      // Navigate to the next step
      navigation.navigate("SetProfilePicture");
    } catch (error) {
      Alert.alert("Validation Error", error.message);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <Pressable
      style={authenticationStyles.wrapper}
      onPress={() => Keyboard.dismiss()}
    >
      <View style={styles.wrapper}>
        {/* Middle Section */}
        <View style={styles.contentContainer}>
          <Text style={authenticationStyles.stepTitle}>Step 2</Text>
          <Text style={authenticationStyles.mainTitle}>
            Profile Information
          </Text>
          <Text style={authenticationStyles.subtitle}>
            Complete your profile to let friends and family learn more about
            you.
          </Text>

          {/* Full Name Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Full Name</Text>
            <TextInput
              style={formStyles.input}
              value={profile.fullName}
              placeholder="Enter your full name"
              placeholderTextColor="#c7c7c7"
              onChangeText={(value) => updateProfile("fullName", value)}
              onFocus={() => (lastFocusedInputRef.current = null)}
              autoComplete="off"
              textContentType="none"
            />
          </View>

          {/* Bio Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Bio</Text>
            <TextInput
              style={formStyles.input}
              value={profile.bio}
              placeholder="Write a short bio"
              placeholderTextColor="#c7c7c7"
              onChangeText={(value) => updateProfile("bio", value)}
              onFocus={() => (lastFocusedInputRef.current = null)}
              autoComplete="off"
              textContentType="none"
            />
          </View>

          {/* Birthday Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Birthday</Text>
            <Pressable
              style={formStyles.input}
              onPress={showDatePicker}
              onFocus={() => (lastFocusedInputRef.current = null)}
            >
              <View style={{ padding: 0 }}>
                <Text
                  style={
                    profile.birthday
                      ? formStyles.inputText
                      : formStyles.placeholderText
                  }
                >
                  {profile.birthday || "MM/DD/YYYY"}
                </Text>
              </View>
            </Pressable>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              textColor="#fff"
            />
          </View>

          {/* Gender Input */}
          <View style={authenticationStyles.inputWrapper}>
            <Text style={formStyles.label}>Gender</Text>
            <View style={{ flexDirection: "row" }}>
              {allowedGenders.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => updateProfile("gender", option)}
                  style={[
                    authenticationStyles.genderButton,
                    profile.gender === option &&
                      authenticationStyles.activeGenderButton,
                  ]}
                >
                  <Text
                    style={[
                      authenticationStyles.genderText,
                      profile.gender === option &&
                        authenticationStyles.activeGenderText,
                    ]}
                  >
                    {option === "PREFER NOT TO SAY"
                      ? "Prefer Not to Say"
                      : option.charAt(0) + option.slice(1).toLowerCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Next Step Button */}
          <AuthenticationButton
            backgroundColor={isValid ? "#6AB95230" : "#1c1c1c"}
            borderColor={isValid ? "#6AB95250" : "#1c1c1c"}
            textColor={isValid ? "#6AB952" : "#696969"}
            width="85%"
            text="Next Step"
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
                index === 1 && styles.activeDot, // Highlight the first dot
              ]}
            />
          ))}
        </View>
      </View>
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
