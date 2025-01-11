import { User } from "../../../../models/index.mjs";
import { isUser, AuthenticationError } from "../../../../utils/auth.mjs";
import { deleteOldProfilePicture } from "../../../../utils/awsHelper.mjs";

export const updateUserData = async (
  _,
  {
    email,
    phoneNumber,
    profilePicture, // This should be the S3 URL
    fullName,
    username,
    bio,
    gender,
    birthday,
    isProfilePrivate,
    darkMode,
    language,
    notifications,
    postRepostToMainFeed,
  },
  { user }
) => {
  try {
    // Ensure user is authenticated
    isUser(user);

    // Find the current user
    const currentUser = await User.findById(user);
    if (!currentUser) throw new AuthenticationError("User not found.");

    // Collect updates
    const updates = {};
    const settingsUpdates = {};

    // Handle profile picture update (expecting S3 URL)
    if (profilePicture) {
      // Delete the old profile picture from S3 if it exists and is not the default
      if (currentUser.profilePicture) {
        await deleteOldProfilePicture(currentUser.profilePicture);
      }

      // Update profile picture URL
      updates.profilePicture = profilePicture;
    }

    // Handle other user data updates
    if (email) updates.email = email.toLowerCase();
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (fullName) updates.fullName = fullName.trim();
    if (username) updates.username = username.toLowerCase().trim();
    if (bio) updates.bio = bio.trim();
    if (gender) updates.gender = gender;
    if (birthday) updates.birthday = birthday;

    // Handle user settings updates
    if (isProfilePrivate !== undefined)
      settingsUpdates.isProfilePrivate = isProfilePrivate;
    if (darkMode !== undefined) settingsUpdates.darkMode = darkMode;
    if (language) settingsUpdates.language = language;
    if (notifications !== undefined)
      settingsUpdates.notifications = notifications;
    if (postRepostToMainFeed !== undefined)
      settingsUpdates.postRepostToMainFeed = postRepostToMainFeed;

    if (Object.keys(settingsUpdates).length > 0) {
      updates.settings = settingsUpdates;
    }

    // Update user data in the database
    const updatedUser = await User.findByIdAndUpdate(user, updates, {
      new: true,
      runValidators: true,
    });

    return {
      success: true,
      message: "User data updated successfully.",
      user: updatedUser,
    };
  } catch (error) {
    console.error(`[UpdateUserData] Error: ${error.message}`);
    throw new Error("An error occurred during the user data update.");
  }
};
