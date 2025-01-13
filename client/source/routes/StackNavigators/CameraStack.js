import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Camera from "../../screens/camera/Camera";
import CameraRoll from "../../screens/camera/CameraRoll";
import DevelopingRoll from "../../screens/camera/DevelopingRoll";
import ManageAlbumShots from "../../screens/camera/albums/ManageAlbumShots";
import ViewAlbum from "../../screens/camera/albums/ViewAlbum";
import AddToAlbums from "../../screens/camera/camerashot/AddToAlbums";
import AddToExperiences from "../../screens/camera/camerashot/AddToExperiences";
import ViewShot from "../../screens/camera/camerashot/ViewShot";
import { StyleSheet, Text, View } from "react-native";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import CameraHeader from "../../screens/camera/components/CameraHeader";
import CreateAlbum from "../../screens/camera/albums/CreateAlbum";
import DevelopingDisplay from "../../displays/DevelopingDisplay";

const Stack = createStackNavigator();

export default function CameraStack() {
  return (
    <Stack.Navigator initialRouteName="Camera">
      {/* Main Camera Screen */}
      <Stack.Screen
        name="Camera"
        component={Camera}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Camera",
          headerTitle: () => (
            <CameraHeader
              navigation={navigation}
              showOptions={false} // Pass the state for dropdown visibility
            />
          ),
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <ButtonIcon
                name="xmark"
                weight="medium"
                onPress={() => navigation.goBack()}
                style={symbolStyles.xmark}
              />
            </View>
          ),
          headerRight: () => (
            <View style={styles.shotsLeftContainer}>
              <Text style={styles.shotsLeftText}>10 Shots</Text>
            </View>
          ),
        })}
      />
      {/* Camera Roll Screens */}
      <Stack.Screen
        name="CameraRoll"
        component={CameraRoll}
        options={{
          headerShown: true,
          title: "Camera Roll",
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-layouts.screen.width, 0], // Slide in from left
                  }),
                },
              ],
            },
          }),
        }}
      />
      <Stack.Screen
        name="DevelopingRoll"
        component={DevelopingRoll}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Developing Roll",
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
        name="DevelopingDisplay"
        component={DevelopingDisplay}
        options={{
          headerShown: true,
          title: "",
          headerTitleStyle: {
            color: "#fff",
          },
          headerStyle: {
            backgroundColor: "#121212",
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      />
      {/* Albums Screens */}
      <Stack.Screen
        name="ManageAlbumShots"
        component={ManageAlbumShots}
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
        name="ViewAlbum"
        component={ViewAlbum}
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
      {/* Camera Shot Screens */}
      <Stack.Screen
        name="CreateAlbum"
        component={CreateAlbum}
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
        name="AddToAlbums"
        component={AddToAlbums}
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
        name="AddToExperiences"
        component={AddToExperiences}
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
        name="ViewShot"
        component={ViewShot}
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
  shotsLeftContainer: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  shotsLeftText: {
    color: "#696969", // Light grey text
    fontSize: 12,
    fontWeight: "500",
  },
});
