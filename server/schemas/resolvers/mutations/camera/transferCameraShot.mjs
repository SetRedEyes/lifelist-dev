import { CameraShot, User } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";

const transferCameraShot = async (_, { shotId }, { user }) => {
  try {
    isUser(user);

    const cameraShot = await CameraShot.findById(shotId).exec();
    if (!cameraShot) throw new Error("Camera shot not found.");

    if (cameraShot.transferredToRoll) {
      return {
        success: false,
        message: "Camera shot already transferred.",
      };
    }

    await User.findByIdAndUpdate(user, {
      $pull: { developingCameraShots: shotId },
      $addToSet: { cameraShots: shotId },
    });

    cameraShot.transferredToRoll = true;
    cameraShot.isDeveloped = true;
    await cameraShot.save();

    return {
      success: true,
      message: "Camera shot successfully transferred.",
    };
  } catch (error) {
    console.error(`Error in transferCameraShot: ${error.message}`);
    throw new Error("Failed to transfer the camera shot.");
  }
};

export default transferCameraShot;
