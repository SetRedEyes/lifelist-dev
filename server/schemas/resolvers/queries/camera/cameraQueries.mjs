import { User, CameraShot, CameraAlbum } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";

export const getAllCameraAlbums = async (_, __, { user }) => {
  isUser(user); // Ensure the user is authenticated

  const albums = await CameraAlbum.find({ author: user })
    .select("_id title coverImage shotsCount")
    .populate("shots", "_id") // Populate only the _id of the shots
    .exec();

  // Transform the albums to include an array of shot IDs
  return albums.map((album) => ({
    _id: album._id,
    title: album.title,
    coverImage: album.coverImage,
    shotsCount: album.shotsCount,
    shots: album.shots.map((shot) => shot._id), // Extract only the _id
  }));
};

export const getCameraAlbum = async (_, { albumId, cursor, limit = 12 }) => {
  // Find the camera album by ID
  const cameraAlbum = await CameraAlbum.findById(albumId)
    .populate({
      path: "shots",
      match: {
        ...(cursor && { capturedAt: { $lt: new Date(cursor) } }), // Apply cursor filter based on `capturedAt`
      },
      options: {
        sort: { capturedAt: -1 }, // Sort by `capturedAt` in descending order
        limit: limit + 1, // Fetch one extra record to determine `hasNextPage`
      },
      select: "_id capturedAt imageThumbnail", // Select only required fields
    })
    .exec();

  if (!cameraAlbum) throw new Error("Camera album not found.");

  const shots = cameraAlbum.shots;

  // Determine if there are more pages
  const hasNextPage = shots.length > limit;
  if (hasNextPage) shots.pop(); // Remove the extra record for pagination

  return {
    album: {
      _id: cameraAlbum._id,
      title: cameraAlbum.title,
      coverImage: cameraAlbum.coverImage,
    },
    shots,
    nextCursor: hasNextPage ? shots[shots.length - 1].capturedAt : null,
    hasNextPage,
  };
};

export const getAllCameraShots = async (
  _,
  { cursor, limit = 10 },
  { user }
) => {
  if (!user) {
    throw new Error("Unauthorized: User ID is required to fetch camera shots.");
  }

  try {
    const userWithShots = await User.findById(user)
      .select("cameraShots")
      .populate({
        path: "cameraShots",
        match: cursor ? { capturedAt: { $lt: new Date(cursor) } } : {},
        options: {
          sort: { capturedAt: -1 },
          limit: limit + 1,
        },
        select: "_id capturedAt image imageThumbnail",
      });

    if (!userWithShots) {
      throw new Error("User not found.");
    }

    // Remove duplicates by creating a unique set of `_id`
    const uniqueShots = Array.from(
      new Map(
        userWithShots.cameraShots.map((shot) => [shot._id.toString(), shot])
      ).values()
    );

    const hasNextPage = uniqueShots.length > limit;
    const shots = hasNextPage ? uniqueShots.slice(0, limit) : uniqueShots;
    const nextCursor = hasNextPage
      ? shots[shots.length - 1].capturedAt.toISOString()
      : null;

    return {
      shots,
      nextCursor,
      hasNextPage,
    };
  } catch (error) {
    console.error("[getAllCameraShots] Error fetching camera shots:", error);
    throw new Error("Failed to fetch camera shots.");
  }
};

export const getCameraShot = async (_, { shotId }) => {
  const cameraShot = await CameraShot.findById(
    shotId,
    "_id image capturedAt"
  ).exec();
  if (!cameraShot) throw new Error("Camera shot not found.");
  return cameraShot;
};

export const getDevelopingCameraShots = async (_, __, { user }) => {
  isUser(user);

  const currentUser = await User.findById(user)
    .populate({
      path: "developingCameraShots",
      match: { transferredToRoll: false }, // Filter directly in the query
      select:
        "_id image imageThumbnail capturedAt developingTime isDeveloped readyToReviewAt",
    })
    .exec();

  if (!currentUser) throw new Error("User not found.");

  return currentUser.developingCameraShots;
};

export const getCameraShotsByImages = async (_, { images }) => {
  return await CameraShot.find({ image: { $in: images } }).select(
    "_id image imageThumbnail capturedAt"
  );
};
