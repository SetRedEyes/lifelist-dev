import { User } from "../../../../models/index.mjs";

export const completeOnboarding = async (_, __, { user }) => {
  try {
    const currentUser = await User.findById(user);

    if (!currentUser) {
      throw new Error("User not found.");
    }

    currentUser.hasCompletedOnboarding = true;
    await currentUser.save();

    return true;
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return false; // Return false if there's an error
  }
};
