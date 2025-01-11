import { Collage, User } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";

export const getMainFeed = async (_, { page = 1 }, { user }) => {
  isUser(user);

  const collagesPerPage = 10;
  const foundUser = await User.findById(user).populate("following");
  const followingIds = foundUser.following.map(
    (followingUser) => followingUser._id
  );

  // Combine all collages the user should see (authored, followed, reposted)
  const collagesQuery = {
    archived: false,
    $or: [
      { author: user },
      { author: { $in: followingIds } },
      { _id: { $in: foundUser.repostedCollages } },
      {
        _id: {
          $in: foundUser.following.reduce(
            (acc, followee) => acc.concat(followee.repostedCollages),
            []
          ),
        },
      },
    ],
  };

  // Calculate the number of collages to skip based on the current page
  const skipAmount = (page - 1) * collagesPerPage;

  // Fetch non-viewed collages first
  const nonViewedCollages = await Collage.find({
    ...collagesQuery,
    _id: { $nin: foundUser.viewedCollages },
  })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(collagesPerPage)
    .select("_id");

  // If non-viewed collages fill the page, return them
  if (nonViewedCollages.length === collagesPerPage) {
    return {
      collages: nonViewedCollages,
      hasMore: true,
    };
  }

  // Otherwise, fetch viewed collages to fill the remaining spots
  const remainingCollages = collagesPerPage - nonViewedCollages.length;
  const viewedCollages = await Collage.find({
    ...collagesQuery,
    _id: { $in: foundUser.viewedCollages },
  })
    .sort({ createdAt: -1 })
    .skip(skipAmount - nonViewedCollages.length)
    .limit(remainingCollages)
    .select("_id");

  // Combine non-viewed and viewed collages
  const paginatedFeed = [...nonViewedCollages, ...viewedCollages];

  return {
    collages: paginatedFeed.map((collage) => ({ _id: collage._id })),
    hasMore: paginatedFeed.length === collagesPerPage,
  };
};
