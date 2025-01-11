import { Collage, User } from "../../../../models/index.mjs";

export const markCollageViewedAndGetCollageById = async (
  _,
  { collageId },
  { user }
) => {
  // Find the user and add the collage ID to viewedCollages if not already present
  await User.findByIdAndUpdate(user, {
    $addToSet: { viewedCollages: collageId },
  });

  // Find the collage by ID and populate necessary fields
  const collage = await Collage.findById(collageId)
    .populate({
      path: "author",
      select: "_id username fullName profilePicture settings",
    })
    .populate({
      path: "likes reposts saves",
      select: "_id",
    })
    .populate({
      path: "tagged",
      select: "_id username fullName profilePicture",
    })
    .lean();

  if (!collage) throw new Error("Collage not found.");

  // Check if the collage has participants
  const hasParticipants = collage.tagged.length > 0;

  // Check if the collage is liked, reposted, or saved by the current user
  const isLikedByCurrentUser = collage.likes.some((like) =>
    like._id.equals(user)
  );
  const isRepostedByCurrentUser = collage.reposts.some((repost) =>
    repost._id.equals(user)
  );
  const isSavedByCurrentUser = collage.saves.some((save) =>
    save._id.equals(user)
  );

  return {
    collage,
    isLikedByCurrentUser,
    isRepostedByCurrentUser,
    isSavedByCurrentUser,
    hasParticipants,
  };
};
