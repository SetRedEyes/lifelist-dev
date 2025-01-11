import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator"; // Main app flow with bottom tabs
import { AdminProfileProvider } from "../contexts/AdminProfileContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { AdminLifeListProvider } from "../contexts/AdminLifeListContext";
import { CameraRollProvider } from "../contexts/CameraRollContext";
import { DevelopingRollProvider } from "../contexts/DevelopingRollContext";
import { CameraAlbumProvider } from "../contexts/CameraAlbumContext";
import { AddExperiencesProvider } from "../contexts/AddExperiencesContext";
import { CreateCollageProvider } from "../contexts/CreateCollageContext";

export default function AppProvidersWrapper() {
  const Stack = createStackNavigator();

  return (
    <AdminProfileProvider>
      <ProfileProvider>
        <AdminLifeListProvider>
          <CameraRollProvider>
            <DevelopingRollProvider>
              <CameraAlbumProvider>
                <AddExperiencesProvider>
                  <CreateCollageProvider>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                      {/* Main application flow */}
                      <Stack.Screen name="MainApp" component={TabNavigator} />
                    </Stack.Navigator>
                  </CreateCollageProvider>
                </AddExperiencesProvider>
              </CameraAlbumProvider>
            </DevelopingRollProvider>
          </CameraRollProvider>
        </AdminLifeListProvider>
      </ProfileProvider>
    </AdminProfileProvider>
  );
}
