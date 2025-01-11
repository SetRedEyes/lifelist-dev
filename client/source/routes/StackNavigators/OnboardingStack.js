import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeOnboarding from "../../screens/onboarding/WelcomeOnboarding";
import BucketListOnboarding from "../../screens/onboarding/BucketListOnboarding";
import CameraOnboarding from "../../screens/onboarding/CameraOnboarding";
import ShareOnboarding from "../../screens/onboarding/ShareOnboarding";
import NotificationsOnboarding from "../../screens/onboarding/NotificationsOnboarding";

const Stack = createStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator initialRouteName="BucketListOnboarding">
      <Stack.Screen
        name="WelcomeOnboarding"
        component={WelcomeOnboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BucketListOnboarding"
        component={BucketListOnboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CameraOnboarding"
        component={CameraOnboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShareOnboarding"
        component={ShareOnboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotificationsOnboarding"
        component={NotificationsOnboarding}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
