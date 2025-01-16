import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import MainFeedStack from "./StackNavigators/MainFeedStack";
import ExploreStack from "./StackNavigators/ExploreStack";
import CameraStack from "./StackNavigators/CameraStack";
import LifeListStack from "./StackNavigators/LifeListStack";
import ProfileStack from "./StackNavigators/ProfileStack";
import TabIcon from "../icons/navbar/TabIcon";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          ...getTabBarVisibility(route, route.name),
          backgroundColor: "#252525",
          borderTopColor: "#1c1c1c",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="MainFeedStack"
        component={MainFeedStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} routeName="Home" />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="ExploreStack"
        component={ExploreStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} routeName="Explore" />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="CameraStack"
        component={CameraStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} routeName="Camera" />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="LifeListStack"
        component={LifeListStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} routeName="LifeList" />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} routeName="Profile" />
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

// Helper function to determine TabBar visibility
function getTabBarVisibility(route, tabName) {
  // Check the focused route name within the nested stack
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? tabName;

  // Screens where the TabBar should be hidden
  const hiddenTabScreens = [
    "CameraStack",
    "AddExperiencesSearch",
    "AddExperiencesOverview",
    "EditProfile",
    "ManageAssociatedShots",
    "DevelopingRoll",
    "CameraRoll",
    "Camera",
    "ViewShot",
    "ViewExperienceFeed",
    "Media",
    "Overview",
    "Preview",
    "ChangeCoverImage",
    "TagUsers",
    "EditMedia",
    "EditOverview",
    "EditTaggedUsers",
    "EditPreview",
    "OnboardingStack",
    "BucketListOnboarding",
    "DevelopingDisplay",
    "Moments",
  ];

  // Hide TabBar if the focused route is in the hidden list
  if (hiddenTabScreens.includes(focusedRouteName)) {
    return { display: "none" }; // Hide the TabBar
  }

  return null; // Default TabBar visibility
}
