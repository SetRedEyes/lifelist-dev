import { User, Notification } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";
import deleteNotification from "../notifications/deleteNotification.mjs";

const unsendFollowRequest = async (_, { userIdToUnfollow }, { user }) => {
  try {
    isUser(user);

    // Check if the follow request exists
    const targetUser = await User.findById(userIdToUnfollow);
    if (!targetUser || !targetUser.followRequests.includes(user)) {
      throw new Error("No follow request exists to unsend.");
    }

    // Optionally, find and delete the related notification
    const notification = await Notification.findOne({
      recipientId: userIdToUnfollow,
      senderId: user,
      type: "FOLLOW_REQUEST",
    });

    if (notification) {
      // Reuse the deleteNotification function
      await deleteNotification(
        _,
        { notificationId: notification._id },
        { user }
      );
    }

    // Remove the follow request from the target user's followRequests list
    await User.findByIdAndUpdate(
      userIdToUnfollow,
      {
        $pull: { followRequests: user },
      },
      { new: true }
    );

    // Remove the userIdToUnfollow from the current user's pendingFriendRequests list
    await User.findByIdAndUpdate(
      user,
      {
        $pull: { pendingFriendRequests: userIdToUnfollow },
      },
      { new: true }
    );

    return {
      success: true,
      message: "Follow request unsent successfully.",
    };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new Error("An error occurred during unsending follow request.");
  }
};

export default unsendFollowRequest;
