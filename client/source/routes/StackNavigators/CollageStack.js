import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ViewCollage from "../../screens/collage/ViewCollage";
import Report from "../../screens/report/Report";

const Stack = createStackNavigator();

export default function CollageStack() {
  return (
    <Stack.Navigator initialRouteName="ViewCollage">
      {/* View Collage Screen */}
      <Stack.Screen
        name="ViewCollage"
        component={ViewCollage}
        options={{ headerShown: true, title: "" }}
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
    </Stack.Navigator>
  );
}
