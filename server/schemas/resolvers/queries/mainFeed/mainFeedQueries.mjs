import { Collage, User } from "../../../../models/index.mjs";

export const getMainFeed = async (_, { limit = 10, cursor }, { user }) => {
  if (!user) {
    throw new Error("Unauthorized: User ID is required.");
  }

  try {
    // Fetch the current user and their following list
    const currentUser = await User.findById(user)
      .select("following collages repostedCollages viewedCollages")
      .populate("following", "collages repostedCollages")
      .exec();

    if (!currentUser) {
      console.error("[getMainFeed] User not found for ID:", user);
      throw new Error("User not found.");
    }

    // Combine collages and reposted collages of the user and their following
    const userCollages = currentUser.collages || [];
    const userRepostedCollages = currentUser.repostedCollages || [];

    const followingCollages = currentUser.following.flatMap(
      (followedUser) => followedUser.collages || []
    );

    const followingRepostedCollages = currentUser.following.flatMap(
      (followedUser) => followedUser.repostedCollages || []
    );

    // Combine and deduplicate collage IDs
    const allCollageIds = Array.from(
      new Set([
        ...userCollages,
        ...userRepostedCollages,
        ...followingCollages,
        ...followingRepostedCollages,
      ])
    );

    // Fetch collages by IDs
    const collagesQuery = Collage.find({ _id: { $in: allCollageIds } })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit + 1) // Fetch one extra to determine if there is a next page
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

    if (cursor) {
      collagesQuery.where("createdAt").lt(new Date(cursor));
    }

    const collages = await collagesQuery.exec();

    // Determine pagination
    const hasNextPage = collages.length > limit;
    const paginatedCollages = hasNextPage ? collages.slice(0, limit) : collages;
    const nextCursor = hasNextPage
      ? paginatedCollages[paginatedCollages.length - 1].createdAt.toISOString()
      : null;

    // Enhance collages with user-specific metadata
    const enhancedCollages = paginatedCollages.map((collage) => {
      const isLikedByCurrentUser = (collage.likes || []).some((like) =>
        like._id.equals(user)
      );
      const isRepostedByCurrentUser = (collage.reposts || []).some((repost) =>
        repost._id.equals(user)
      );
      const isSavedByCurrentUser = (collage.saves || []).some((save) =>
        save._id.equals(user)
      );
      const hasParticipants = (collage.tagged || []).length > 0;
      const isViewedByCurrentUser = (currentUser.viewedCollages || []).some(
        (viewed) => viewed.equals(collage._id)
      );

      return {
        ...collage,
        isLikedByCurrentUser,
        isRepostedByCurrentUser,
        isSavedByCurrentUser,
        hasParticipants,
        isViewedByCurrentUser,
      };
    });

    return {
      collages: enhancedCollages,
      nextCursor,
      hasNextPage,
    };
  } catch (error) {
    console.error("[getMainFeed] Error fetching main feed:", error);
    throw new Error("Failed to fetch main feed.");
  }
};
