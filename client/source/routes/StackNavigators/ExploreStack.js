import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Explore from "../../screens/explore/Explore";
import ProfileStack from "./ProfileStack";
import CollageStack from "./CollageStack";

const Stack = createStackNavigator();

export default function ExploreStack() {
  return (
    <Stack.Navigator initialRouteName="Explore">
      <Stack.Screen
        name="Explore"
        component={Explore}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollageStack"
        component={CollageStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
