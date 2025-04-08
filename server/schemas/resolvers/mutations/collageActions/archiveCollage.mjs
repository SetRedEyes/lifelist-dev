import { User, Collage } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";

const archiveCollage = async (_, { collageId }, { user }) => {
  try {
    isUser(user); // Ensure the user is authenticated

    // Update the user's archivedCollages list
    const updatedUser = await User.findByIdAndUpdate(
      user,
      { $addToSet: { archivedCollages: collageId } },
      { new: true }
    );

    // Update the collage's archived status
    const updatedCollage = await Collage.findByIdAndUpdate(
      collageId,
      { $set: { archived: true } },
      { new: true } // Return the updated collage document
    );

    if (!updatedUser || !updatedCollage) {
      throw new Error("Failed to archive collage.");
    }

    return {
      success: true,
      message: "Collage successfully archived.",
      collage: {
        _id: updatedCollage._id, // Use _id as part of the collage object
        coverImage: updatedCollage.coverImage,
        createdAt: updatedCollage.createdAt,
      },
    };
  } catch (error) {
    console.error("Error in archiveCollage resolver:", error.message);
    throw new Error("An error occurred while archiving the collage.");
  }
};

export default archiveCollage;
