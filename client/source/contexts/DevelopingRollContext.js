import React, { createContext, useCallback, useContext, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_DEVELOPING_CAMERA_SHOTS } from "../utils/queries/cameraQueries";
import {
  saveMetadataToCache,
  getMetadataFromCache,
  saveImageToFileSystem,
  deleteImageFromFileSystem,
} from "../utils/caching/cacheHelpers";
import { DELETE_CAMERA_SHOT } from "../utils/mutations/cameraMutations";

const DevelopingRollContext = createContext();

// Cache Key Constants
const CACHE_KEY_DEVELOPING = "developingCameraShots";
const SHOTS_LEFT_KEY = "shotsLeft";
const MAX_SHOTS_PER_DAY = 10;

export const DevelopingRollProvider = ({ children }) => {
  const [developingShots, setDevelopingShots] = useState([]);
  const [
    isDevelopingRollCacheInitialized,
    setIsDevelopingRollCacheInitialized,
  ] = useState(false);
  const [shotsLeft, setShotsLeft] = useState(MAX_SHOTS_PER_DAY);

  // Apollo Mutation for deleting a shot
  const [deleteCameraShot] = useMutation(DELETE_CAMERA_SHOT);

  // Fetch developing shots from the server
  const [fetchDevelopingShots] = useLazyQuery(GET_DEVELOPING_CAMERA_SHOTS, {
    fetchPolicy: "network-only",
    onCompleted: async (data) => {
      try {
        const serverShots = data?.getDevelopingCameraShots || [];

        // Cache thumbnails for each shot
        for (const shot of serverShots) {
          const cacheKey = `developing_shot_${shot._id}`;
          await saveImageToFileSystem(cacheKey, shot.imageThumbnail, true); // Save to DOCUMENT_DIR
        }

        // Update state and cache metadata
        setDevelopingShots(serverShots);
        await saveMetadataToCache(CACHE_KEY_DEVELOPING, serverShots);
        setIsDevelopingRollCacheInitialized(true);
      } catch (error) {
        console.error(
          "[DevelopingRollContext] Error processing fetched shots:",
          error
        );
      }
    },
    onError: (error) => {
      console.error(
        "[DevelopingRollContext] Error fetching developing shots:",
        error
      );
    },
  });

  // Initialize developing roll and shotsLeft from cache or fetch from the server
  const initializeDevelopingRoll = async () => {
    if (isDevelopingRollCacheInitialized) return;

    try {
      // Load developing shots
      const cachedShots = await getMetadataFromCache(CACHE_KEY_DEVELOPING);

      if (cachedShots) {
        setDevelopingShots(cachedShots);
      } else {
        await fetchDevelopingShots();
      }

      // Load shotsLeft from cache
      const cachedShotsLeft = await getMetadataFromCache(SHOTS_LEFT_KEY, true);
      if (cachedShotsLeft !== null) {
        setShotsLeft(cachedShotsLeft);
      } else {
        await resetShotsLeft(); // Reset shotsLeft if no cache
      }

      setIsDevelopingRollCacheInitialized(true);
    } catch (error) {
      console.error("[DevelopingRollContext] Error initializing cache:", error);
    }
  };

  // Reset shotsLeft for a new day
  const resetShotsLeft = async () => {
    try {
      setShotsLeft(MAX_SHOTS_PER_DAY);
      const ttl = getTimeUntilMidnight();
      await saveMetadataToCache(SHOTS_LEFT_KEY, MAX_SHOTS_PER_DAY, true, ttl);
    } catch (error) {
      console.error(
        "[DevelopingRollContext] Error resetting shotsLeft:",
        error
      );
    }
  };

  // Decrease shotsLeft when a shot is added
  const decrementShotsLeft = async () => {
    if (shotsLeft <= 0) {
      throw new Error("No shots left for today.");
    }

    try {
      const updatedShotsLeft = shotsLeft - 1;
      setShotsLeft(updatedShotsLeft);
      await saveMetadataToCache(SHOTS_LEFT_KEY, updatedShotsLeft, true);
    } catch (error) {
      console.error(
        "[DevelopingRollContext] Error decrementing shotsLeft:",
        error
      );
    }
  };

  // Increment shotsLeft when a shot is removed
  const incrementShotsLeft = async () => {
    try {
      if (shotsLeft < MAX_SHOTS_PER_DAY) {
        const updatedShotsLeft = shotsLeft + 1;
        setShotsLeft(updatedShotsLeft);
        await saveMetadataToCache(SHOTS_LEFT_KEY, updatedShotsLeft, true);
      }
    } catch (error) {
      console.error(
        "[DevelopingRollContext] Error incrementing shotsLeft:",
        error
      );
    }
  };

  // Helper: Get time until midnight
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  // Add a new shot to the developing roll
  const addShot = async (newShot) => {
    try {
      console.log("NEWSHOT:", newShot);

      const updatedShots = [newShot, ...developingShots];
      setDevelopingShots(updatedShots);

      // Decrease shotsLeft
      await decrementShotsLeft();

      // Cache metadata and thumbnail
      await saveMetadataToCache(CACHE_KEY_DEVELOPING, updatedShots);
      const cacheKey = `developing_shot_${newShot._id}`;
      await saveImageToFileSystem(cacheKey, newShot.imageThumbnail, true);
    } catch (error) {
      console.error("[DevelopingRollContext] Error adding shot:", error);
    }
  };

  // Remove a shot from the developing roll
  const removeShot = async (shotId, isRetake = false) => {
    try {
      // Check if the shot exists locally before attempting removal
      const shotExists = developingShots.some((shot) => shot._id === shotId);
      if (!shotExists) {
        console.warn(
          `[DevelopingRollContext] Shot ${shotId} does not exist locally.`
        );
        return;
      }

      // Only delete from S3 if it's a retake
      if (isRetake) {
        const { data } = await deleteCameraShot({ variables: { shotId } });

        if (!data?.deleteCameraShot?.success) {
          console.warn(
            `[DevelopingRollContext] Failed to delete shot ${shotId} remotely: ${data?.deleteCameraShot?.message}`
          );
        } else {
          console.log(
            `[DevelopingRollContext] Shot ${shotId} deleted from S3.`
          );
        }
      }

      // Remove the shot locally
      const updatedShots = developingShots.filter(
        (shot) => shot._id !== shotId
      );
      setDevelopingShots(updatedShots);

      // Increment shotsLeft ONLY if it's a retake
      if (isRetake && shotsLeft < MAX_SHOTS_PER_DAY) {
        await incrementShotsLeft();
      }

      // Update cache and delete thumbnail
      const cacheKey = `developing_shot_${shotId}`;
      await saveMetadataToCache(CACHE_KEY_DEVELOPING, updatedShots);
      await deleteImageFromFileSystem(cacheKey);
    } catch (error) {
      console.error("[DevelopingRollContext] Error removing shot:", error);
      throw new Error("Failed to remove the shot. Please try again.");
    }
  };

  // Update a shot's metadata
  const updateShot = (shotId, updates) => {
    try {
      const updatedShots = developingShots.map((shot) =>
        shot._id === shotId ? { ...shot, ...updates } : shot
      );
      setDevelopingShots(updatedShots);

      // Update cache metadata
      saveMetadataToCache(CACHE_KEY_DEVELOPING, updatedShots);
    } catch (error) {
      console.error("[DevelopingRollContext] Error updating shot:", error);
    }
  };

  // Recalculate the developed status for each shot
  const recalculateDevelopedStatus = useCallback(async () => {
    try {
      const now = new Date();
      const updatedShots = developingShots.map((shot) => ({
        ...shot,
        isDeveloped: new Date(shot.readyToReviewAt) <= now,
      }));

      // Only update if there's a change
      if (JSON.stringify(updatedShots) !== JSON.stringify(developingShots)) {
        setDevelopingShots(updatedShots);
        await saveMetadataToCache(CACHE_KEY_DEVELOPING, updatedShots);
      }
    } catch (error) {
      console.error(
        "[DevelopingRollContext] Error recalculating statuses:",
        error
      );
    }
  }, [developingShots]);

  // Reset developing roll state
  const resetDevelopingRoll = () => {
    setDevelopingShots([]);
    setIsDevelopingRollCacheInitialized(false);
  };

  const contextValue = {
    developingShots,
    shotsLeft,
    addShot,
    removeShot,
    updateShot,
    initializeDevelopingRoll,
    isDevelopingRollCacheInitialized,
    recalculateDevelopedStatus,
    resetDevelopingRoll,
    decrementShotsLeft,
    incrementShotsLeft,
    resetShotsLeft,
  };

  return (
    <DevelopingRollContext.Provider value={contextValue}>
      {children}
    </DevelopingRollContext.Provider>
  );
};

// Custom hook to access DevelopingRollContext
export const useDevelopingRoll = () => useContext(DevelopingRollContext);
