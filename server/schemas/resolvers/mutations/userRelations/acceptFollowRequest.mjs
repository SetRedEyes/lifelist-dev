import { User } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";
import createNotification from "../notifications/createNotification.mjs";

const acceptFollowRequest = async (_, { userIdToAccept }, { user }) => {
  try {
    isUser(user);

    // Add the target user to the current user's 'following' list
    const updatedUser = await User.findByIdAndUpdate(
      user,
      {
        $addToSet: { following: userIdToAccept },
        $pull: { followRequests: userIdToAccept }, // Remove follow request
      },
      { new: true }
    );

    if (!updatedUser) throw new Error("Current user's document not found.");

    // Add the current user to the target user's 'followers' list
    const newFollower = await User.findByIdAndUpdate(
      userIdToAccept,
      { $addToSet: { followers: user } },
      { new: true }
    );

    if (!newFollower) throw new Error("User to accept not found.");

    // Remove the current user from the pendingFriendRequests list of the target user
    await User.findByIdAndUpdate(
      userIdToAccept,
      { $pull: { pendingFriendRequests: user } },
      { new: true }
    );

    // Notify the target user of follow request acceptance
    await createNotification({
      recipientId: userIdToAccept,
      senderId: user,
      type: "FOLLOW_ACCEPTED",
      message: `has accepted your follow request.`,
    });

    return {
      success: true,
      message: "Follow request successfully accepted.",
    };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("An error occurred during accepting follow request.");
  }
};

export default acceptFollowRequest;
