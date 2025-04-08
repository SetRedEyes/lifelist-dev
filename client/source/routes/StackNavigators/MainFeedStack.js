import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, StyleSheet, View } from "react-native";
import MainFeed from "../../screens/mainfeed/MainFeed";
import AllMoments from "../../screens/mainfeed/AllMoments";
import MomentsFeed from "../../screens/mainfeed/MomentsFeed";
import ChangeCoverImage from "../../screens/mainfeed/createcollage/ChangeCoverImage";
import Media from "../../screens/mainfeed/createcollage/Media";
import Overview from "../../screens/mainfeed/createcollage/Overview";
import Preview from "../../screens/mainfeed/createcollage/Preview";
import TagUsers from "../../screens/mainfeed/createcollage/TagUsers";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import Report from "../../screens/report/Report";
import CollageStack from "./CollageStack";
import EditMedia from "../../screens/collage/editcollage/EditMedia";
import EditOverview from "../../screens/collage/editcollage/EditOverview";
import EditCoverImage from "../../screens/collage/editcollage/EditCoverImage";
import EditTaggedUsers from "../../screens/collage/editcollage/EditTaggedUsers";
import EditPreview from "../../screens/collage/editcollage/EditPreview";
import { headerStyles } from "../../styles/components";
import OnboardingStack from "./OnboardingStack";
import ProfileStack from "./ProfileStack";
import EarlyAccess from "../../screens/authentication/EarlyAccess";

const Stack = createStackNavigator();

export default function MainFeedStack() {
  return (
    <Stack.Navigator initialRouteName="MainFeed">
      <Stack.Screen
        name="MainFeed"
        component={MainFeed}
        options={{
          headerShown: true,
          title: "Moments Feed",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      {/* Moments Screen */}
      <Stack.Screen
        name="AllMoments"
        component={AllMoments}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Moments",
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
                onPress={() => navigation.goBack()} // Go back to the previous screen
                style={symbolStyles.backArrow}
              />
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="MomentsFeed"
        component={MomentsFeed}
        options={{
          headerShown: true,
          title: "Moments Feed",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      {/* Create Collage Screens */}
      <Stack.Screen
        name="Media"
        component={Media}
        options={{
          headerShown: false,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Overview"
        component={Overview}
        options={{
          headerShown: false,
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
        name="ChangeCoverImage"
        component={ChangeCoverImage}
        options={{
          headerShown: false,
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
        name="TagUsers"
        component={TagUsers}
        options={{
          headerShown: false,
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
        name="Preview"
        component={Preview}
        options={{
          headerShown: false,
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
        name="EditMedia"
        component={EditMedia}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="EditOverview"
        component={EditOverview}
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
        name="EditCoverImage"
        component={EditCoverImage}
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
        name="EditTaggedUsers"
        component={EditTaggedUsers}
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
        name="EditPreview"
        component={EditPreview}
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
      {/* Report Screen */}
      <Stack.Screen
        name="Report"
        component={Report}
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
      {/* Collage Stack */}
      <Stack.Screen
        name="CollageStack"
        component={CollageStack}
        options={{
          headerShown: false, // Disable the default header from Stack.Navigator
        }}
      />
      {/* Onboarding Stack */}
      <Stack.Screen
        name="OnboardingStack"
        component={OnboardingStack}
        options={{
          headerShown: false, // Disable the default header from Stack.Navigator
        }}
      />
      <Stack.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EarlyAccessScreen"
        component={EarlyAccess}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
  headerLeftText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff", // White text for contrast on dark background
  },
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
  },
  logo: {
    marginTop: 6,
    width: 90,
  },
  createButtonText: {
    fontSize: 12,
    color: "#696969",
    fontWeight: "600",
  },
  createButtonTextActive: {
    color: "#6AB952",
    fontWeight: "700",
  },
});
