import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import EditProfile from "../../screens/profile/tabs/EditProfile";
import EditContact from "../../screens/profile/tabs/EditContact";
import EditSettings from "../../screens/profile/tabs/EditSettings";
import { useRoute } from "@react-navigation/native";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useAdminProfile } from "../../contexts/AdminProfileContext";
import DangerAlert from "../../alerts/DangerAlert";
import { navigatorStyles } from "../../styles/components/navigatorStyles";

const { width } = Dimensions.get("window");

const tabs = [
  { name: "Profile", component: EditProfile },
  { name: "Contact", component: EditContact },
  { name: "Settings", component: EditSettings },
];

export default function EditProfileNavigator() {
  const { unsavedChanges, resetAdminChanges } = useAdminProfile();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState(
    route.params?.initialTab || "Profile"
  );
  const [pendingTab, setPendingTab] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const translateX = useSharedValue(0);
  const resetChangesRef = useRef({});

  useEffect(() => {
    translateX.value = tabs.findIndex((tab) => tab.name === activeTab) * -width;
  }, [activeTab, translateX]);

  const handleTabPress = (tabName) => {
    if (unsavedChanges) {
      setPendingTab(tabName);
      setShowAlert(true);
    } else {
      setActiveTab(tabName);
    }
  };

  const handleDiscardChanges = () => {
    resetAdminChanges();
    setActiveTab(pendingTab);
    setShowAlert(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(translateX.value, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
      },
    ],
  }));

  const renderScreen = () => {
    return tabs.map((tab) => (
      <View key={tab.name} style={navigatorStyles.screen}>
        {React.createElement(tab.component, {
          registerResetChanges: (resetFn) => {
            resetChangesRef.current[tab.name] = resetFn;
          },
        })}
      </View>
    ));
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={navigatorStyles.editProfileNavigatorWrapper}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.name}
            style={[
              navigatorStyles.navigatorButton,
              navigatorStyles.editProfileNavigatorButton,
              activeTab === tab.name && navigatorStyles.activeNavigatorButton,
            ]}
            onPress={() => handleTabPress(tab.name)}
          >
            <Text
              style={[
                navigatorStyles.navigatorText,
                activeTab === tab.name && navigatorStyles.activeNavigatorText,
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <Animated.View
        style={[navigatorStyles.editProfileScreenContainer, animatedStyle]}
      >
        {renderScreen()}
      </Animated.View>

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
