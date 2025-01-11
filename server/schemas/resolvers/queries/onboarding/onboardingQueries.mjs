import { User } from "../../../../models/index.mjs";

export const checkOnboardingStatus = async (_, __, { user }) => {
  try {
    const currentUser = await User.findById(user);

    if (!currentUser) {
      throw new Error("User not found.");
    }

    return currentUser.hasCompletedOnboarding || false;
  } catch (error) {
    console.error("Error retrieving onboarding status:", error);
    return false; // Return false if there's an error
  }
};
