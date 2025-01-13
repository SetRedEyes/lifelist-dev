import React, { createContext, useContext, useState } from "react";
import {
  saveMetadataToCache,
  getMetadataFromCache,
  saveImageToFileSystem,
  deleteImageFromFileSystem,
} from "../utils/caching/cacheHelpers";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USER_LIFELIST } from "../utils/queries/lifeListQueries";
import {
  ADD_LIFELIST_EXPERIENCE,
  REMOVE_LIFELIST_EXPERIENCE,
  UPDATE_LIFELIST_EXPERIENCE,
} from "../utils/mutations/lifelistMutations";
import { useAuth } from "./AuthContext";

const AdminLifeListContext = createContext();

const CACHE_KEY_LIFELIST = "lifelist";
const CACHE_KEY_LIFELIST_IMAGE_PREFIX = "experience_image_";

export const AdminLifeListProvider = ({ children }) => {
  const [lifeList, setLifeList] = useState(null);
  const [isLifeListCacheInitialized, setIsLifeListCacheInitialized] =
    useState(false);
  const { currentUser } = useAuth();

  const [fetchLifeList] = useLazyQuery(GET_USER_LIFELIST);
  const [addLifeListExperience] = useMutation(ADD_LIFELIST_EXPERIENCE);
  const [updateLifeListExperience] = useMutation(UPDATE_LIFELIST_EXPERIENCE);
  const [removeLifeListExperience] = useMutation(REMOVE_LIFELIST_EXPERIENCE);

  // === Initialize LifeList Cache ===
  const initializeLifeListCache = async (limit = 12) => {
    if (isLifeListCacheInitialized) return;

    try {
      const cachedLifeList = await getMetadataFromCache(CACHE_KEY_LIFELIST);

      if (cachedLifeList) {
        setLifeList(cachedLifeList);
        setIsLifeListCacheInitialized(true);
        return;
      }

      const { data } = await fetchLifeList({
        variables: { userId: currentUser, limit },
      });
      if (data?.getUserLifeList) {
        await cacheLifeList(data.getUserLifeList);
        setLifeList(data.getUserLifeList);
      }

      setIsLifeListCacheInitialized(true);
    } catch (error) {
      console.error("Error initializing LifeList cache:", error);
      setIsLifeListCacheInitialized(false);
    }
  };

  // === Cache LifeList ===
  const cacheLifeList = async (lifeList) => {
    if (!lifeList || !lifeList.experiences) return;

    try {
      const experiences = lifeList.experiences.map((exp) => ({
        ...exp,
        associatedShots: exp.associatedShots.map((shot) => ({
          _id: shot._id,
          capturedAt: shot.capturedAt,
          image: shot.image,
          imageThumbnail: shot.imageThumbnail,
        })),
      }));

      const lifeListToCache = { ...lifeList, experiences };
      await saveMetadataToCache(CACHE_KEY_LIFELIST, lifeListToCache);
      await cacheImages(experiences);
    } catch (error) {
      console.error("Error caching LifeList:", error);
    }
  };

  // === Cache Images Helper ===
  const cacheImages = async (experiences) => {
    try {
      for (const exp of experiences) {
        const cacheKey = `${CACHE_KEY_LIFELIST_IMAGE_PREFIX}${exp._id}`;
        if (exp.image) {
          await saveImageToFileSystem(cacheKey, exp.image);
        }
      }
    } catch (error) {
      console.error("Error caching images:", error);
    }
  };

  // === Add LifeList Experience ===
  const addLifeListExperienceToCache = async (newExperience) => {
    try {
      console.log("Adding new experience:", newExperience);

      // Transform associatedShots to IDs
      const shotIds =
        newExperience.associatedShots?.map((shot) => shot._id) || [];

      console.log("shotIds:", shotIds);

      const { data } = await addLifeListExperience({
        variables: {
          lifeListId: lifeList._id,
          experienceId: newExperience.experience._id,
          list: newExperience.list,
          associatedShots: shotIds, // Pass IDs only
        },
      });

      if (data?.addLifeListExperience?.success) {
        const lifeListExperienceId =
          data.addLifeListExperience.lifeListExperienceId;

        // Transform the new experience for local caching
        const transformedNewExperience = {
          ...newExperience,
          _id: lifeListExperienceId,
          hasAssociatedShots: Boolean(newExperience.associatedShots?.length),
        };

        // Update local state
        const updatedExperiences = [
          transformedNewExperience,
          ...lifeList.experiences,
        ];
        const updatedLifeList = {
          ...lifeList,
          experiences: updatedExperiences,
        };

        setLifeList((prevLifeList) => ({
          ...prevLifeList,
          experiences: [transformedNewExperience, ...prevLifeList.experiences],
        }));

        // Cache updated LifeList and images
        await cacheLifeList(updatedLifeList);

        console.log("Updated LifeList after adding experience.");
      }
    } catch (error) {
      console.error(
        "[AdminLifeListContext] Error adding experience to LifeList:",
        error
      );
    }
  };

  // === Update LifeList Experience ===
  const updateLifeListExperienceInCache = async (updatedExperience) => {
    try {
      const shotIds =
        updatedExperience.associatedShots?.map((shot) => shot._id) || [];

      const { data } = await updateLifeListExperience({
        variables: {
          lifeListExperienceId: updatedExperience.lifeListExperienceId,
          list: updatedExperience.list,
          associatedShots: shotIds,
        },
      });

      if (data?.updateLifeListExperience?.success) {
        const updatedExperiences = lifeList.experiences.map((exp) =>
          exp._id === updatedExperience.lifeListExperienceId
            ? { ...exp, ...updatedExperience }
            : exp
        );

        const updatedLifeList = {
          ...lifeList,
          experiences: updatedExperiences,
        };

        setLifeList(updatedLifeList);

        // Cache updated LifeList and images
        await cacheLifeList(updatedLifeList);

        console.log("Updated LifeList after updating experience.");
      }
    } catch (error) {
      console.error(
        "[AdminLifeListContext] Error updating experience in LifeList:",
        error
      );
    }
  };

  // === Remove LifeList Experience ===
  const removeLifeListExperienceFromCache = async (lifeListExperienceId) => {
    try {
      const { data } = await removeLifeListExperience({
        variables: {
          lifeListId: lifeList._id,
          lifeListExperienceId,
        },
      });

      if (data?.removeLifeListExperience?.success) {
        const updatedExperiences = lifeList.experiences.filter(
          (exp) => exp._id !== lifeListExperienceId
        );

        const updatedLifeList = {
          ...lifeList,
          experiences: updatedExperiences,
        };

        setLifeList(updatedLifeList);

        // Cache updated LifeList
        await cacheLifeList(updatedLifeList);

        // Remove cached image
        const cacheKey = `${CACHE_KEY_LIFELIST_IMAGE_PREFIX}${lifeListExperienceId}`;
        await deleteImageFromFileSystem(cacheKey);
      }
    } catch (error) {
      console.error(
        "[AdminLifeListContext] Error removing experience from LifeList:",
        error
      );
    }
  };

  const contextValue = {
    lifeList,
    isLifeListCacheInitialized,
    initializeLifeListCache,
    addLifeListExperienceToCache,
    updateLifeListExperienceInCache,
    removeLifeListExperienceFromCache,
    resetLifeListState: () => {
      setLifeList(null);
      setIsLifeListCacheInitialized(false);
    },
  };

  return (
    <AdminLifeListContext.Provider value={contextValue}>
      {children}
    </AdminLifeListContext.Provider>
  );
};

export const useAdminLifeList = () => useContext(AdminLifeListContext);
