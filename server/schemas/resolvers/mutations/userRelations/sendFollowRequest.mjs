import { User } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";
import createNotification from "../notifications/createNotification.mjs";

const sendFollowRequest = async (_, { userIdToFollow }, { user }) => {
  try {
    // Ensure the user is authenticated
    isUser(user);

    // Find the target user to follow
    const targetUser = await User.findById(userIdToFollow);
    if (!targetUser) {
      throw new Error("User not found.");
    }

    // Check if the follow request already exists or if the user is already following
    if (
      targetUser.followRequests.includes(user) ||
      targetUser.followers.includes(user)
    ) {
      throw new Error(
        "Follow request already sent or user is already followed."
      );
    }

    // Update the followRequests and pendingFriendRequests lists
    await User.findByIdAndUpdate(
      userIdToFollow,
      { $addToSet: { followRequests: user } }, // Add the current user to followRequests
      { new: true }
    );

    await User.findByIdAndUpdate(
      user,
      { $addToSet: { pendingFriendRequests: userIdToFollow } }, // Add the target user to pendingFriendRequests
      { new: true }
    );

    // Send a notification
    await createNotification({
      recipientId: userIdToFollow,
      senderId: user,
      type: "FOLLOW_REQUEST",
      message: `has sent you a follow request.`,
    });

    return {
      success: true,
      message: "Follow request successfully sent.",
    };
  } catch (error) {
    console.error(`Send Follow Request Error: ${error.message}`);
    throw new Error("Unable to send follow request due to a server error.");
  }
};

export default sendFollowRequest;
