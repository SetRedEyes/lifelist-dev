import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      const onboardingKey = await AsyncStorage.getItem(
        "onBoardingProcess_status"
      );
      setHasCompletedOnboarding(onboardingKey === "true");
    };

    loadOnboardingStatus();
  }, []);

  return (
    <OnboardingContext.Provider
      value={{ hasCompletedOnboarding, setHasCompletedOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
