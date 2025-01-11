import {
  Pressable,
  Text,
  View,
  ScrollView,
  Linking,
  Keyboard,
} from "react-native";
import {
  formStyles,
  layoutStyles,
  symbolStyles,
} from "../../../styles/components/index";
import { useState, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import DangerAlert from "../../../alerts/DangerAlert";
import Icon from "../../../icons/Icon";
import GlobalSwitch from "../../../icons/GlobalSwitch";
import { editProfileStyles } from "../../../styles/screens/editProfileStyles";
import AuthenticationButton from "../../../buttons/AuthenticationButton";

export default function EditSettings() {
  const navigation = useNavigation();
  const {
    adminProfile,
    updateAdminProfileField,
    saveAdminProfile,
    resetAdminChanges,
  } = useAdminProfile();

  const [showAlert, setShowAlert] = useState(false);
  const [originalPrivacy, setOriginalPrivacy] = useState(
    adminProfile?.settings?.isProfilePrivate || false
  );
  const [isModified, setIsModified] = useState(false);

  // Track changes in the Private switch to enable Save/Discard buttons
  useEffect(() => {
    const currentPrivacy = adminProfile?.settings?.isProfilePrivate || false;
    setIsModified(currentPrivacy !== originalPrivacy);
  }, [adminProfile, originalPrivacy]);

  // Handle back press to show an alert if there are unsaved changes
  const handleBackPress = () => {
    if (isModified) {
      setShowAlert(true);
    } else {
      navigation.goBack();
    }
  };

  // Manage navigation prevention if there are unsaved changes
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

  // Handle save changes
  const handleSaveChanges = async () => {
    await saveAdminProfile();
    setOriginalPrivacy(adminProfile?.settings?.isProfilePrivate || false);
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    updateAdminProfileField("settings", {
      ...adminProfile.settings,
      isProfilePrivate: originalPrivacy,
    });
    resetAdminChanges();
  };

  // Open device's notification settings
  const openNotificationSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={layoutStyles.wrapper}>
      <ScrollView contentContainerStyle={editProfileStyles.container}>
        {/* Account Privacy Section */}
        <Text style={editProfileStyles.header}>Account Privacy</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={formStyles.label}>Private</Text>
          <GlobalSwitch
            isOn={adminProfile?.settings?.isProfilePrivate || false}
            onToggle={(value) =>
              updateAdminProfileField("settings", {
                ...adminProfile.settings,
                isProfilePrivate: value,
              })
            }
          />
        </View>

        <Pressable
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
          onPress={() => navigation.navigate("BlockedUsers")}
        >
          <Text style={formStyles.label}>Blocked Users</Text>
          <View style={{ marginRight: 16 }}>
            <Icon
              name="chevron.forward"
              noFill={true}
              weight="semibold"
              style={symbolStyles.forwardArrow}
            />
          </View>
        </Pressable>

        {/* General Settings Section */}
        <Text style={[editProfileStyles.header, { marginTop: 16 }]}>
          General Settings
        </Text>
        <View>
          <Pressable
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
            onPress={openNotificationSettings}
          >
            <Text style={formStyles.label}>Notifications</Text>
            <View style={{ marginRight: 16 }}>
              <Icon
                name="chevron.forward"
                noFill={true}
                weight="semibold"
                style={symbolStyles.forwardArrow}
              />
            </View>
          </Pressable>
        </View>

        {/* Save Changes Button */}
        <AuthenticationButton
          backgroundColor={isModified ? "#6AB95230" : "#1c1c1c"}
          borderColor={isModified ? "#6AB95250" : "#1c1c1c"}
          textColor={isModified ? "#6AB952" : "#696969"}
          width="100%"
          text="Update Privacy"
          onPress={handleSaveChanges}
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
              backgroundColor="#1c1c1c"
              borderColor="#1c1c1c"
              textColor="#696969"
              width="100%"
              text="Discard Changes"
              onPress={handleDiscardChanges}
            />
          </View>
        )}
      </ScrollView>

      {/* Danger Alert for Unsaved Changes */}
      <DangerAlert
        visible={showAlert}
        onRequestClose={() => setShowAlert(false)}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        onConfirm={() => {
          handleDiscardChanges();
          setShowAlert(false);
          navigation.goBack();
        }}
        onCancel={() => setShowAlert(false)}
      />
    </View>
  );
}
