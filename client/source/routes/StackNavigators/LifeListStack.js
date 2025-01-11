import React, { useState, useRef, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LifeList from "../../screens/lifelist/LifeList";
import ListView from "../../screens/lifelist/ListView";
import AddExperiencesOverview from "../../screens/lifelist/addexperiences/AddExperiencesOverview";
import AddExperiencesSearch from "../../screens/lifelist/addexperiences/AddExperiencesSearch";
import ManageTemporaryShots from "../../screens/lifelist/addexperiences/ManageTemporaryShots";
import ManageAssociatedShots from "../../screens/lifelist/experiences/ManageAssociatedShots";
import ViewExperience from "../../screens/lifelist/experiences/ViewExperience";
import ViewExperienceFeed from "../../screens/lifelist/experiences/ViewExperienceFeed";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";

const Stack = createStackNavigator();

export default function LifeListStack() {
  return (
    <Stack.Navigator
      initialRouteName="LifeList"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#121212", // Header background color
        },
      }}
    >
      {/* Main LifeList Screen */}
      <Stack.Screen
        name="LifeList"
        component={LifeList}
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
      {/* ListView Screen */}
      <Stack.Screen
        name="ListView"
        component={ListView}
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
      {/* Add Experiences Screens */}
      <Stack.Screen
        name="AddExperiencesOverview"
        component={AddExperiencesOverview}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Add Experiences",
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
                onPress={() => navigation.goBack()}
                style={symbolStyles.backArrow}
              />
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {/* Add Button */}
              <Pressable>
                <Text style={styles.createButtonTextActive}>Add</Text>
              </Pressable>
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="AddExperiencesSearch"
        component={AddExperiencesSearch}
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
        name="ManageTemporaryShots"
        component={ManageTemporaryShots}
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
      {/* Experience Screens */}
      <Stack.Screen
        name="ManageAssociatedShots"
        component={ManageAssociatedShots}
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
        name="ViewExperience"
        component={ViewExperience}
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
        name="ViewExperienceFeed"
        component={ViewExperienceFeed}
        options={{ headerShown: true, title: "Experience Feed" }}
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
