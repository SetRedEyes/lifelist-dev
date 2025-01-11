import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import EditProfileNavigator from "../../navigators/profile/EditProfileNavigator";
import ButtonIcon from "../../icons/ButtonIcon";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import DangerAlert from "../../alerts/DangerAlert";
import { useAdminProfile } from "../../contexts/AdminProfileContext";
import {
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../styles/components/index";

export default function EditProfile() {
  const navigation = useNavigation();
  const { unsavedChanges, resetAdminChanges } = useAdminProfile();
  const [showAlert, setShowAlert] = useState(false);

  // Handle back navigation
  const handleBackPress = () => {
    if (unsavedChanges) {
      setShowAlert(true); // Show alert if there are unsaved changes
    } else {
      navigation.goBack(); // Go back if no changes
    }
  };

  // Confirm discarding changes
  const handleDiscardChanges = () => {
    resetAdminChanges();
    setShowAlert(false);
    navigation.goBack();
  };

  // Prevent navigation when unsaved changes exist
  useFocusEffect(
    useCallback(() => {
      const beforeRemoveListener = (e) => {
        if (!unsavedChanges) return;
        e.preventDefault();
        setShowAlert(true);
      };

      navigation.addListener("beforeRemove", beforeRemoveListener);
      return () => {
        navigation.removeListener("beforeRemove", beforeRemoveListener);
      };
    }, [unsavedChanges, navigation])
  );

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Edit Profile",
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={handleBackPress}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
    });
  }, [navigation, unsavedChanges]);

  return (
    <View style={layoutStyles.wrapper}>
      <EditProfileNavigator />
      <DangerAlert
        visible={showAlert}
        onRequestClose={() => setShowAlert(false)}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={handleDiscardChanges}
        onCancel={() => setShowAlert(false)}
        confirmButtonText="Leave"
        cancelButtonText="Stay"
      />
    </View>
  );
}
