import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Profile from "../../screens/profile/Profile";
import AdminProfile from "../../screens/profile/AdminProfile";
import Moments from "../../screens/profile/tabs/Moments";
import EditProfile from "../../screens/profile/EditProfile";
import UserRelations from "../../screens/profile/UserRelations";
import Archived from "../../screens/profile/options/Archived";
import BlockedUsers from "../../screens/profile/options/BlockedUsers";
import InviteFriends from "../../screens/profile/options/InviteFriends";
import Notifications from "../../screens/profile/options/Notifications";
import FriendRequests from "../../screens/profile/options/FriendRequests";
import Saved from "../../screens/profile/options/Saved";
import Tagged from "../../screens/profile/options/Tagged";
import CameraStack from "./CameraStack";
import CollageStack from "./CollageStack";
import Report from "../../screens/report/Report";
import { StyleSheet, View } from "react-native";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import EditPreview from "../../screens/collage/editcollage/EditPreview";
import EditTaggedUsers from "../../screens/collage/editcollage/EditTaggedUsers";
import EditCoverImage from "../../screens/collage/editcollage/EditCoverImage";
import EditOverview from "../../screens/collage/editcollage/EditOverview";
import EditMedia from "../../screens/collage/editcollage/EditMedia";
import ViewCollage from "../../screens/collage/ViewCollage";

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="AdminProfile"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#121212", // Header background color
        },
      }}
    >
      {/* Main Screens */}
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfile}
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
        name="Profile"
        component={Profile}
        options={{
          headerShown: true,
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
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
        name="UserRelations"
        component={UserRelations}
        options={({ navigation }) => ({
          headerShown: true,
          title: "User Relations",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="Moments"
        component={Moments}
        options={{ headerShown: true, title: "Moments" }}
      />
      {/* Options Screens */}
      <Stack.Screen
        name="Archived"
        component={Archived}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Archived",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="BlockedUsers"
        component={BlockedUsers}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Blocked Users",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="InviteFriends"
        component={InviteFriends}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Invite Friends",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="Saved"
        component={Saved}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Saved",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="Tagged"
        component={Tagged}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Tagged",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="Notifications"
        component={Notifications}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Notifications",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
        name="FriendRequests"
        component={FriendRequests}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Friend Requests",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
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
      <Stack.Screen
        name="CameraStack"
        component={CameraStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollageStack"
        component={CollageStack}
        options={{ headerShown: false }}
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
      <Stack.Screen
        name="ViewCollage"
        component={ViewCollage}
        options={{ headerShown: true, title: "" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
  headerLeftText: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
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
