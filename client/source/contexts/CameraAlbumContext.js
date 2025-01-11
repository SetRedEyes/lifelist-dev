import React, { createContext, useContext, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_ALL_CAMERA_ALBUMS,
  GET_CAMERA_ALBUM,
} from "../utils/queries/cameraQueries";
import {
  saveMetadataToCache,
  getMetadataFromCache,
  saveImageToFileSystem,
  getImageFromFileSystem,
  deleteImageFromFileSystem,
} from "../utils/caching/cacheHelpers";
import {
  CREATE_CAMERA_ALBUM,
  DELETE_CAMERA_ALBUM,
  UPDATE_ALBUM_SHOTS,
} from "../utils/mutations/cameraMutations";

const CameraAlbumContext = createContext();

const CACHE_KEY_ALBUMS = "cameraAlbums";
const CACHE_KEY_SHOTS_PREFIX = "camera_album_shots_";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

export const CameraAlbumProvider = ({ children }) => {
  const [albums, setAlbums] = useState([]);
  const [albumShotsCache, setAlbumShotsCache] = useState({});
  const [isAlbumCacheInitialized, setIsAlbumCacheInitialized] = useState(false);

  const [fetchAlbums] = useLazyQuery(GET_ALL_CAMERA_ALBUMS, {
    fetchPolicy: "network-only",
    onCompleted: async (fetchedData) => {
      const fetchedAlbums = fetchedData?.getAllCameraAlbums || [];
      setAlbums(fetchedAlbums);

      await saveMetadataToCache(CACHE_KEY_ALBUMS, fetchedAlbums);

      // Cache album cover images
      for (const album of fetchedAlbums) {
        const cacheKey = `camera_album_${album._id}`;
        if (!(await getImageFromFileSystem(cacheKey))) {
          await saveImageToFileSystem(cacheKey, album.coverImage, true);
        }
      }

      setIsAlbumCacheInitialized(true);
    },
    onError: (error) => {
      console.error("[CameraAlbumContext] Error fetching albums:", error);
    },
  });

  const [fetchAlbumShots] = useLazyQuery(GET_CAMERA_ALBUM, {
    fetchPolicy: "network-only",
  });

  const [updateAlbumShots] = useMutation(UPDATE_ALBUM_SHOTS);
  const [deleteAlbum] = useMutation(DELETE_CAMERA_ALBUM);
  const [createAlbum] = useMutation(CREATE_CAMERA_ALBUM);

  // Initialize album cache
  const initializeAlbumCache = async () => {
    if (isAlbumCacheInitialized) return;

    try {
      const cachedData = await getMetadataFromCache(CACHE_KEY_ALBUMS);

      if (cachedData) {
        setAlbums(cachedData);
        setIsAlbumCacheInitialized(true);
      } else {
        await fetchAlbums();
      }
    } catch (error) {
      console.error(
        "[CameraAlbumContext] Error initializing album cache:",
        error
      );
    }
  };

  // Check cache validity based on TTL
  const isCacheValid = (timestamp) => {
    return Date.now() - timestamp < CACHE_TTL;
  };

  // Fetch and cache paginated shots for a specific album
  const fetchPaginatedAlbumShots = async (
    albumId,
    cursor = null,
    limit = 12
  ) => {
    if (!albumId) {
      console.error("[CameraAlbumContext] Invalid albumId provided.");
      return { shots: [], nextCursor: null, hasNextPage: false };
    }

    const cacheKey = `${CACHE_KEY_SHOTS_PREFIX}${albumId}`;
    try {
      const cachedData = await getMetadataFromCache(cacheKey);

      // Validate cache TTL
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        console.log(
          "[CameraAlbumContext] Using valid cache for album:",
          albumId
        );
        return {
          shots: cachedData.shots,
          nextCursor: cachedData.nextCursor,
          hasNextPage: cachedData.hasNextPage,
        };
      }

      console.log(
        "[CameraAlbumContext] Cache expired or not found. Fetching from server."
      );
      const { data } = await fetchAlbumShots({
        variables: { albumId, cursor, limit },
      });

      if (!data?.getCameraAlbum) {
        console.warn(
          "[CameraAlbumContext] No album data returned from server."
        );
        return { shots: [], nextCursor: null, hasNextPage: false };
      }

      const { shots, nextCursor, hasNextPage } = data.getCameraAlbum;

      // Merge shots to avoid duplicates
      const mergedShots = [
        ...(cachedData?.shots || []),
        ...shots.filter(
          (shot) => !cachedData?.shots?.some((s) => s._id === shot._id)
        ),
      ];

      setAlbumShotsCache((prev) => ({ ...prev, [albumId]: mergedShots }));

      // Save shots and timestamp to cache
      await saveMetadataToCache(cacheKey, {
        shots: mergedShots,
        timestamp: Date.now(),
        nextCursor,
        hasNextPage,
      });

      // Cache thumbnails for fetched shots
      for (const shot of shots) {
        const thumbnailKey = `thumbnail_${shot._id}`;
        if (!(await getImageFromFileSystem(thumbnailKey))) {
          await saveImageToFileSystem(thumbnailKey, shot.imageThumbnail, true);
        }
      }

      return { shots: mergedShots, nextCursor, hasNextPage };
    } catch (error) {
      console.error("[CameraAlbumContext] Error fetching album shots:", error);
      return { shots: [], nextCursor: null, hasNextPage: false };
    }
  };

  // Other methods (addAlbumToCache, removeAlbumFromCache, updateAlbumShotsInCache, etc.) remain unchanged.

  // Add a new album
  const addAlbumToCache = async (newAlbumData) => {
    try {
      console.log("[CameraAlbumContext] AddAlbumToCache Started");

      const { data } = await createAlbum({ variables: newAlbumData });
      console.log(data);

      if (data?.createCameraAlbum?.success) {
        const albumId = data.createCameraAlbum.albumId;

        if (!albumId) {
          console.error("[CameraAlbumContext] Missing album ID in response.");
          return null;
        }

        const createdAlbum = {
          _id: albumId,
          title: newAlbumData.title,
          coverImage: newAlbumData.coverImage,
          shotsCount: newAlbumData.shotsCount,
        };

        // Update in-memory albums state
        const updatedAlbums = [createdAlbum, ...albums];
        setAlbums(updatedAlbums);

        // Cache updated albums list
        await saveMetadataToCache(CACHE_KEY_ALBUMS, updatedAlbums);

        // Save cover image to file system for offline access
        if (newAlbumData.coverImage) {
          await saveImageToFileSystem(
            `camera_album_${albumId}`,
            newAlbumData.coverImage,
            true // Save to DOCUMENT_DIR
          );
        }

        return albumId; // Return the album ID for navigation
      } else {
        console.error(
          "[CameraAlbumContext] Album creation failed:",
          data?.createAlbum?.message
        );
        return null;
      }
    } catch (error) {
      console.error("[CameraAlbumContext] Error creating album:", error);
      return null;
    }
  };

  // Remove an album
  const removeAlbumFromCache = async (albumId) => {
    try {
      const { data } = await deleteAlbum({ variables: { albumId } });
      console.log(data);

      if (data?.deleteCameraAlbum?.success) {
        console.log("SUCCESS");

        const updatedAlbums = albums.filter((album) => album._id !== albumId);
        setAlbums(updatedAlbums);
        await saveMetadataToCache(CACHE_KEY_ALBUMS, updatedAlbums);

        const cacheKey = `${CACHE_KEY_SHOTS_PREFIX}${albumId}`;
        await saveMetadataToCache(cacheKey, []);
        await deleteImageFromFileSystem(`camera_album_${albumId}`);
      }
    } catch (error) {
      console.error("[CameraAlbumContext] Error deleting album:", error);
    }
  };

  // Update album shots and metadata
  const updateAlbumShotsInCache = async (albumId, updatedShots) => {
    try {
      const shotIds = updatedShots.map((shot) => shot._id);
      const { data } = await updateAlbumShots({
        variables: { albumId, shotIds },
      });

      console.log("Data:", data);

      if (data?.updateAlbumShots?.success) {
        const updatedAlbums = albums.map((album) =>
          album._id === albumId
            ? {
                ...album,
                shots: updatedShots, // Update the shots
                shotsCount: updatedShots.length, // Update the shots count
              }
            : album
        );

        setAlbums(updatedAlbums);
        await saveMetadataToCache(CACHE_KEY_ALBUMS, updatedAlbums);

        setAlbumShotsCache((prev) => ({ ...prev, [albumId]: updatedShots }));
        const cacheKey = `${CACHE_KEY_SHOTS_PREFIX}${albumId}`;
        await saveMetadataToCache(cacheKey, updatedShots);
        console.log("we made it all the way through!");
      }
    } catch (error) {
      console.error("[CameraAlbumContext] Error updating album shots:", error);
    }
  };

  const resetCameraAlbumState = () => {
    setAlbums([]);
    setAlbumShotsCache({});
    setIsAlbumCacheInitialized(false);
  };

  const contextValue = {
    albums,
    albumShotsCache,
    fetchAlbums,
    addAlbumToCache,
    removeAlbumFromCache,
    updateAlbumShotsInCache,
    fetchPaginatedAlbumShots,
    initializeAlbumCache,
    isAlbumCacheInitialized,
    resetCameraAlbumState,
  };

  return (
    <CameraAlbumContext.Provider value={contextValue}>
      {children}
    </CameraAlbumContext.Provider>
  );
};

export const useCameraAlbums = () => useContext(CameraAlbumContext);
