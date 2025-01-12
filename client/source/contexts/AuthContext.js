import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../utils/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@apollo/client";
import { COMPLETE_ONBOARDING } from "../utils/mutations/onboardingMutations";

// Create AuthContext
const AuthContext = createContext({});

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Apollo Mutation for completing onboarding
  const [completeOnboardingMutation] = useMutation(COMPLETE_ONBOARDING);

  // Check initial authentication and onboarding status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const isLoggedIn = await AuthService.loggedIn();
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn) {
        const userData = await AuthService.getUser();
        setCurrentUser(userData);

        // Check if onboarding is complete for this user
        const onboardingStatus = await AsyncStorage.getItem(
          `isOnboardingComplete_${userData}`
        );
        setIsOnboardingComplete(onboardingStatus === "true");
      }
    };

    checkAuthStatus();
  }, []);

  // Login method
  const login = async (token) => {
    try {
      await AuthService.saveToken(token);
      const userData = await AuthService.getUser();
      setCurrentUser(userData);
      setIsAuthenticated(true);

      // Retrieve onboarding status for this user
      const onboardingStatus = await AsyncStorage.getItem(
        `isOnboardingComplete_${userData}`
      );
      console.log("onboardingStatus", onboardingStatus);

      // Handle missing onboarding status
      if (onboardingStatus === null) {
        setIsOnboardingComplete(false); // Default to false if not set
      } else {
        setIsOnboardingComplete(onboardingStatus === "true");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      // Preserve early access values
      const earlyAccessCode = await AsyncStorage.getItem("earlyAccessCode");
      const isEarlyAccessUnlocked = await AsyncStorage.getItem(
        "isEarlyAccessUnlocked"
      );

      // Preserve onboarding status for the current user
      const onboardingKey = `isOnboardingComplete_${currentUser}`;
      const onboardingStatus = await AsyncStorage.getItem(onboardingKey);

      // Perform logout and clear sensitive data
      await AuthService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsOnboardingComplete(false);

      // Clear AsyncStorage but restore early access values
      await AsyncStorage.clear();
      if (earlyAccessCode) {
        await AsyncStorage.setItem("earlyAccessCode", earlyAccessCode);
      }
      if (isEarlyAccessUnlocked) {
        await AsyncStorage.setItem(
          "isEarlyAccessUnlocked",
          isEarlyAccessUnlocked
        );
      }
      if (onboardingStatus) {
        await AsyncStorage.setItem(onboardingKey, onboardingStatus);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Mark onboarding as complete
  const completeOnboarding = async () => {
    if (currentUser) {
      try {
        // Run the COMPLETE_ONBOARDING mutation
        await completeOnboardingMutation();

        // Set the onboarding complete status
        await AsyncStorage.setItem(
          `isOnboardingComplete_${currentUser}`,
          "true"
        );
        setIsOnboardingComplete(true);
      } catch (error) {
        console.error("Error setting onboarding complete status:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        isOnboardingComplete,
        setIsOnboardingComplete,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
