import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { useLazyQuery } from "@apollo/client";
import { CHECK_ONBOARDING_STATUS } from "../utils/queries/onboardingQueries";

// Main Navigation Flows
import TabNavigator from "./TabNavigator";
import AuthenticationStack from "./StackNavigators/AuthenticationStack";

// Context Providers
import { AdminProfileProvider } from "../contexts/AdminProfileContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { AdminLifeListProvider } from "../contexts/AdminLifeListContext";
import { DevelopingRollProvider } from "../contexts/DevelopingRollContext";
import { CameraRollProvider } from "../contexts/CameraRollContext";
import { AddExperiencesProvider } from "../contexts/AddExperiencesContext";
import { CameraAlbumProvider } from "../contexts/CameraAlbumContext";
import { CreateCollageProvider } from "../contexts/CreateCollageContext";

// Loading Screen
import Loading from "../screens/loading/Loading";
import { CollageListsProvider } from "../contexts/CollageListsContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isChecking, setIsChecking] = useState(true);
  const [isEarlyAccessUnlocked, setIsEarlyAccessUnlocked] = useState(null);
  const [isLoadingOnboardingStatus, setIsLoadingOnboardingStatus] =
    useState(true);

  const {
    isAuthenticated,
    isOnboardingComplete,
    currentUser,
    setIsOnboardingComplete,
  } = useAuth();

  const [checkOnboardingStatus] = useLazyQuery(CHECK_ONBOARDING_STATUS, {
    onCompleted: async (data) => {
      if (data && data.checkOnboardingStatus) {
        // Save to AsyncStorage and update state
        await AsyncStorage.setItem(
          `isOnboardingComplete_${currentUser}`,
          "true"
        );
        setIsOnboardingComplete(true);
      } else {
        setIsOnboardingComplete(false);
      }
      setIsLoadingOnboardingStatus(false);
    },
    onError: (error) => {
      console.error("Error checking onboarding status:", error);
      setIsLoadingOnboardingStatus(false);
    },
  });

  // Check Early Access from AsyncStorage
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const earlyAccessValue = await AsyncStorage.getItem(
          "isEarlyAccessUnlocked"
        );
        setIsEarlyAccessUnlocked(earlyAccessValue === "true");
      } catch (error) {
        console.error("Error checking early access status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkInitialStatus();
  }, [isAuthenticated]);

  /*   // Automatically check onboarding status when currentUser changes
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (currentUser) {
        try {
          const onboardingStatus = await AsyncStorage.getItem(
            `isOnboardingComplete_${currentUser}`
          );

          if (!onboardingStatus) {
            setIsOnboardingComplete(onboardingStatus === "false");
          } else {
            setIsOnboardingComplete(onboardingStatus === "true");
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        } finally {
          setIsLoadingOnboardingStatus(false);
        }
      } else {
        setIsLoadingOnboardingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, [currentUser]); */

  useEffect(() => {
    const checkOnboardingStatusAsync = async () => {
      if (currentUser) {
        try {
          // Check AsyncStorage for saved onboarding status
          const onboardingStatus = await AsyncStorage.getItem(
            `isOnboardingComplete_${currentUser}`
          );

          if (onboardingStatus !== null) {
            // We found a saved status in AsyncStorage (either "true" or "false")
            setIsOnboardingComplete(onboardingStatus === "true");
            setIsLoadingOnboardingStatus(false);
          } else {
            // No status found — query the server
            checkOnboardingStatus();
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setIsLoadingOnboardingStatus(false);
        }
      } else {
        setIsLoadingOnboardingStatus(false);
      }
    };

    checkOnboardingStatusAsync();
  }, [currentUser]);

  // Show loading screen while checking
  if (isChecking || isLoadingOnboardingStatus) return <Loading />;

  return (
    <NavigationContainer>
      {isEarlyAccessUnlocked === false ? (
        <AuthenticationStack initialRouteName="EarlyAccess" />
      ) : !isAuthenticated ? (
        <AuthenticationStack initialRouteName="Login" />
      ) : !isOnboardingComplete ||
        isOnboardingComplete === false ||
        isOnboardingComplete === null ? (
        <AuthenticationStack initialRouteName="BucketListOnboarding" />
      ) : (
        <AdminProfileProvider>
          <ProfileProvider>
            <AdminLifeListProvider>
              <CameraRollProvider>
                <DevelopingRollProvider>
                  <CameraAlbumProvider>
                    <AddExperiencesProvider>
                      <CreateCollageProvider>
                        <CollageListsProvider>
                          <Stack.Navigator
                            screenOptions={{
                              headerShown: false,
                              cardStyle: { backgroundColor: "#121212" },
                            }}
                          >
                            <Stack.Screen
                              name="MainApp"
                              component={TabNavigator}
                            />
                          </Stack.Navigator>
                        </CollageListsProvider>
                      </CreateCollageProvider>
                    </AddExperiencesProvider>
                  </CameraAlbumProvider>
                </DevelopingRollProvider>
              </CameraRollProvider>
            </AdminLifeListProvider>
          </ProfileProvider>
        </AdminProfileProvider>
      )}
    </NavigationContainer>
  );
}
