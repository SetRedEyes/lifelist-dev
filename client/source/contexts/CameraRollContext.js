import React, { createContext, useContext, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  GET_ALL_CAMERA_SHOTS,
  GET_CAMERA_SHOT,
} from "../utils/queries/cameraQueries";
import { DELETE_CAMERA_SHOT } from "../utils/mutations/cameraMutations";
import LRUCache from "../utils/caching/lruCacheHelper";

const CameraRollContext = createContext();

export const CameraRollProvider = ({ children }) => {
  const [shots, setShots] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Initialize LRU Cache for full-resolution images (max 20 items)
  const fullResolutionCache = new LRUCache(20);

  const { refetch: fetchShots } = useQuery(GET_ALL_CAMERA_SHOTS, {
    skip: true, // Use refetch for manual invocation
  });

  const [fetchShot] = useLazyQuery(GET_CAMERA_SHOT);
  const [deleteCameraShot] = useMutation(DELETE_CAMERA_SHOT);

  // === Load Next Page ===
  const loadNextPage = async () => {
    if (!hasNextPage) return;

    try {
      const { data } = await fetchShots({
        cursor: nextCursor,
        limit: 12,
      });

      if (!data?.getAllCameraShots) {
        console.warn("[CameraRoll] No data returned from fetchShots.");
        return;
      }

      const {
        shots: newShots,
        nextCursor: newCursor,
        hasNextPage: newHasNextPage,
      } = data.getAllCameraShots;

      const mergedShots = Array.from(
        new Map(
          [...shots, ...newShots].map((shot) => [shot._id, shot])
        ).values()
      );

      setShots(mergedShots);
      setNextCursor(newCursor);
      setHasNextPage(newHasNextPage);
    } catch (error) {
      console.error("[CameraRoll] Error loading next page:", error);
    }
  };

  // === Fetch Full-Resolution Image ===
  const fetchFullResolutionImage = async (shotId) => {
    try {
      if (fullResolutionCache.has(shotId)) {
        console.log(`Cache hit for ${shotId}`);
        return fullResolutionCache.get(shotId);
      }

      console.log(`Cache miss for ${shotId}, fetching from server...`);
      const { data } = await fetchShot({ variables: { shotId } });
      if (!data?.getCameraShot) throw new Error("Image not found.");

      const image = data.getCameraShot.image;
      fullResolutionCache.put(shotId, image);

      console.log(
        "Current Full-Resolution Cache:",
        Array.from(fullResolutionCache.cache.entries())
      );
      return image;
    } catch (error) {
      console.error(
        `[CameraRoll] Error fetching full-resolution image for ${shotId}:`,
        error
      );
      return null;
    }
  };

  // === Preload Full-Resolution Images ===
  const preloadFullResolutionImages = async (index, range = 2) => {
    const preloadPromises = [];

    for (
      let i = Math.max(index - range, 0);
      i <= Math.min(index + range, shots.length - 1);
      i++
    ) {
      const shot = shots[i];
      if (shot && !fullResolutionCache.has(shot._id)) {
        preloadPromises.push(fetchFullResolutionImage(shot._id));
      }
    }

    await Promise.all(preloadPromises); // Fetch all images in parallel
  };

  // === Add Shot to Camera Roll ===
  const addShotToRoll = (newShot) => {
    try {
      const existingShotIds = new Set(shots.map((shot) => shot._id));
      if (existingShotIds.has(newShot._id)) return;

      const updatedShots = [newShot, ...shots].sort(
        (a, b) => new Date(b.capturedAt) - new Date(a.capturedAt)
      );

      setShots(updatedShots);
    } catch (error) {
      console.error("[CameraRoll] Error adding shot:", error);
    }
  };

  // === Remove Shot from Camera Roll ===
  const removeShotFromRoll = async (shotId) => {
    try {
      const updatedShots = shots.filter((shot) => shot._id !== shotId);
      setShots(updatedShots);

      const { data } = await deleteCameraShot({ variables: { shotId } });
      if (!data?.deleteCameraShot?.success) {
        console.error(
          `Failed to delete shot ${shotId}: ${data?.deleteCameraShot?.message}`
        );
      }

      // Remove the image from the cache
      fullResolutionCache.cache.delete(shotId);
    } catch (error) {
      console.error(`[CameraRoll] Error removing shot ${shotId}:`, error);
    }
  };

  // === Reset Camera Roll State ===
  const resetCameraRollState = () => {
    setShots([]);
    setNextCursor(null);
    setHasNextPage(true);
    fullResolutionCache.cache.clear(); // Clear the cache
  };

  const contextValue = {
    shots,
    hasNextPage,
    loadNextPage,
    fetchFullResolutionImage,
    preloadFullResolutionImages,
    addShotToRoll,
    removeShotFromRoll,
    resetCameraRollState,
  };

  return (
    <CameraRollContext.Provider value={contextValue}>
      {children}
    </CameraRollContext.Provider>
  );
};

export const useCameraRoll = () => useContext(CameraRollContext);
