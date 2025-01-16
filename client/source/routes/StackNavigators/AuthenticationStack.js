import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EarlyAccess from "../../screens/authentication/EarlyAccess";
import ForgotPassword from "../../screens/authentication/ForgotPassword";
import Login from "../../screens/authentication/Login";
import SetLoginInformation from "../../screens/authentication/SetLoginInformation";
import SetPermissions from "../../screens/authentication/SetPermissions";
import SetProfileInformation from "../../screens/authentication/SetProfileInformation";
import SetProfilePicture from "../../screens/authentication/SetProfilePicture";

// Onboarding Screens
import WelcomeOnboarding from "../../screens/onboarding/WelcomeOnboarding";
import BucketListOnboarding from "../../screens/onboarding/BucketListOnboarding";
import CameraOnboarding from "../../screens/onboarding/CameraOnboarding";
import ShareOnboarding from "../../screens/onboarding/ShareOnboarding";
import NotificationsOnboarding from "../../screens/onboarding/NotificationsOnboarding";

const Stack = createStackNavigator();

export default function AuthenticationStack({ initialRouteName = "SignUp" }) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name="EarlyAccess"
        component={EarlyAccess}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetLoginInformation"
        component={SetLoginInformation}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      <Stack.Screen
        name="SetProfileInformation"
        component={SetProfileInformation}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      <Stack.Screen
        name="SetProfilePicture"
        component={SetProfilePicture}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      <Stack.Screen
        name="SetPermissions"
        component={SetPermissions}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      {/* <Stack.Screen
        name="VerifyAccount"
        component={VerifyAccount}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      /> */}

      {/* Onboarding Screens */}
      <Stack.Screen
        name="WelcomeOnboarding"
        component={WelcomeOnboarding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BucketListOnboarding"
        component={BucketListOnboarding}
        options={{ headerShown: false, gestureEnabled: false }}
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
