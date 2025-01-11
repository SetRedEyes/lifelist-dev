import bcrypt from "bcryptjs";
import { isUser } from "../../../../utils/auth.mjs";
import { User } from "../../../../models/index.mjs";

export const updatePassword = async (
  _,
  { currentPassword, newPassword },
  { user }
) => {
  try {
    // Ensure the user is authenticated
    isUser(user);

    // Find the user in the database
    const existingUser = await User.findById(user);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if the current password is correct using your existing method
    const isMatch = await existingUser.isCorrectPassword(currentPassword);
    if (!isMatch) {
      throw new Error("Incorrect current password");
    }

    // Ensure the new password is different from the current password
    const isSameAsCurrent = await bcrypt.compare(
      newPassword,
      existingUser.password
    );
    if (isSameAsCurrent) {
      throw new Error(
        "New password must be different from the current password."
      );
    }

    // Validate the new password (length, characters, etc.)
    if (
      !existingUser.schema.path("password").options.match[0].test(newPassword)
    ) {
      throw new Error(existingUser.schema.path("password").options.match[1]);
    }

    // Update the password and save the user
    existingUser.password = newPassword;
    await existingUser.save();

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
