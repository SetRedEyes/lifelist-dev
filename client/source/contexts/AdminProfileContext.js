import React, { createContext, useContext, useState, useEffect } from "react";
import {
  saveMetadataToCache,
  getMetadataFromCache,
  saveImageToFileSystem,
  getImageFromFileSystem,
} from "../utils/caching/cacheHelpers";
import { UPDATE_USER_DATA } from "../utils/mutations/userActionMutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_COLLAGES_REPOSTS_MOMENTS,
  GET_USER_COUNTS,
  GET_USER_DATA,
} from "../utils/queries/userQueries";
import { GET_PRESIGNED_URL } from "../utils/queries/cameraQueries";
import { useAuth } from "./AuthContext";
import { DELETE_MOMENT, POST_MOMENT } from "../utils/mutations/momentMutations";
import * as FileSystem from "expo-file-system";

// Cache Keys
const PROFILE_CACHE_KEY = "profile_cache";
const PROFILE_PICTURE_KEY = "profile_picture_cache";
const COUNTS_CACHE_KEY = "counts_cache";
const COLLAGES_CACHE_KEY = "collages_cache";
const REPOSTS_CACHE_KEY = "reposts_cache";
const MOMENTS_CACHE_KEY = "moments_cache";

// TTLs
const TTL_USER_DATA = 24 * 60 * 60 * 1000; // 24 hours
const TTL_COLLAGES_REPOSTS_MOMENTS = 6 * 60 * 60 * 1000; // 6 hours
const TTL_USER_COUNTS = 5 * 60 * 1000; // 5 minutes

// Context
const AdminProfileContext = createContext();

export const useAdminProfile = () => useContext(AdminProfileContext);

export const AdminProfileProvider = ({ children }) => {
  const { currentUser } = useAuth();
  // State for admin profile
  const [adminProfile, setAdminProfile] = useState(null);
  const [originalAdminProfile, setOriginalAdminProfile] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [profilePictureUri, setProfilePictureUri] = useState(null);
  const [isSaving, setIsSaving] = useState(null);

  // State for counts
  const [counts, setCounts] = useState({
    followersCount: 0,
    followingCount: 0,
    collagesCount: 0,
  });

  // State for collages, reposts, and moments
  const [collages, setCollages] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [moments, setMoments] = useState([]);
  const [hasActiveMoments, setHasActiveMoments] = useState(false);

  // State for pagination
  const [collagesCursor, setCollagesCursor] = useState(null);
  const [repostsCursor, setRepostsCursor] = useState(null);
  const [hasNextCollagesPage, setHasNextCollagesPage] = useState(false);
  const [hasNextRepostsPage, setHasNextRepostsPage] = useState(false);

  // === Mutations ===
  const [updateAdminDataMutation] = useMutation(UPDATE_USER_DATA);
  const [postMomentMutation] = useMutation(POST_MOMENT);
  const [deleteMomentMutation] = useMutation(DELETE_MOMENT);
  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL);

  // === Methods for Admin Profile ===

  // === Update Admin Profile Field ===
  const updateAdminProfileField = (field, value) => {
    setAdminProfile((prevProfile) => ({
      ...prevProfile,
      [field]: value,
    }));
    setUnsavedChanges(true);
  };

  // === Save Admin Profile ===
  const saveAdminProfile = async () => {
    if (!adminProfile) return;

    try {
      let profilePictureUrl = adminProfile.profilePicture;

      console.log("profilePictureUrl", profilePictureUrl);
      console.log("adminProfile.profilePicture", adminProfile.profilePicture);

      // Upload the profile picture to S3 if a new image is selected
      if (
        profilePictureUri &&
        profilePictureUri !== originalAdminProfile.profilePicture // Compare against original profile picture URL
      ) {
        const fileName = profilePictureUri.split("/").pop();
        const { data } = await getPresignedUrl({
          variables: {
            folder: "profile-images",
            fileName,
            fileType: "image/jpeg",
          },
        });

        const { presignedUrl, fileUrl } = data.getPresignedUrl;

        // Fetch the image as a blob
        const response = await fetch(profilePictureUri);
        if (!response.ok) throw new Error("Failed to fetch image.");
        const blob = await response.blob();

        // Upload the image to S3
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        if (!uploadResponse.ok)
          throw new Error("Failed to upload image to S3.");

        // Use the S3 URL returned from the server
        profilePictureUrl = fileUrl;
      }

      // Prepare variables for the mutation
      const variables = {
        email: adminProfile.email,
        phoneNumber: adminProfile.phoneNumber,
        fullName: adminProfile.fullName,
        username: adminProfile.username,
        bio: adminProfile.bio,
        gender: adminProfile.gender,
        birthday: adminProfile.birthday,
        isProfilePrivate: adminProfile.settings?.isProfilePrivate,
        darkMode: adminProfile.settings?.darkMode,
        language: adminProfile.settings?.language,
        notifications: adminProfile.settings?.notifications,
        postRepostToMainFeed: adminProfile.settings?.postRepostToMainFeed,
        profilePicture: profilePictureUrl, // Correct S3 URL
      };

      // Execute mutation
      const { data } = await updateAdminDataMutation({ variables });

      if (data?.updateUserData?.success) {
        const updatedProfile = data.updateUserData.user;

        // Update state
        setAdminProfile(updatedProfile);
        setOriginalAdminProfile(updatedProfile);
        setUnsavedChanges(false);

        // Cache the updated profile
        await saveMetadataToCache(PROFILE_CACHE_KEY, updatedProfile);

        console.log("Admin profile saved successfully.");
      } else {
        console.error(
          "Failed to save admin profile:",
          data?.updateUserData?.message
        );
      }
    } catch (error) {
      console.error("Error saving admin profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const resetAdminChanges = () => {
    setAdminProfile(originalAdminProfile);
    setUnsavedChanges(false);
  };

  // Lazy query for fetching data if cache is invalid or empty
  const [fetchAdminProfile] = useLazyQuery(GET_USER_DATA, {
    variables: { userId: currentUser },
    fetchPolicy: "network-only",
    onCompleted: async (data) => {
      try {
        const profile = data?.getUserData;
        if (profile) {
          setAdminProfile(profile);
          setOriginalAdminProfile(profile);

          await saveMetadataToCache(
            PROFILE_CACHE_KEY,
            profile,
            true,
            TTL_USER_DATA
          );

          let cachedProfilePictureUri = await getImageFromFileSystem(
            PROFILE_PICTURE_KEY,
            TTL_USER_DATA
          );

          if (!cachedProfilePictureUri) {
            cachedProfilePictureUri = await saveImageToFileSystem(
              PROFILE_PICTURE_KEY,
              profile.profilePicture,
              true,
              TTL_USER_DATA
            );
          }

          setProfilePictureUri(cachedProfilePictureUri);
        }
      } catch (error) {
        console.error("Error handling admin profile caching:", error);
      }
    },
  });

  const [fetchUserCounts] = useLazyQuery(GET_USER_COUNTS, {
    variables: { userId: currentUser },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const counts = data?.getUserCounts;
      if (counts) {
        setCounts(counts);
        saveMetadataToCache(COUNTS_CACHE_KEY, counts, true, TTL_USER_COUNTS);
      }
    },
  });

  const [fetchCollagesRepostsMoments] = useLazyQuery(
    GET_COLLAGES_REPOSTS_MOMENTS,
    {
      variables: {
        userId: currentUser,
        collagesCursor: null,
        repostsCursor: null,
        limit: 15,
      },
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        const { collages, repostedCollages, moments } =
          data?.getCollagesRepostsMoments || {};

        if (collages) {
          setCollages((prev) => [...prev, ...collages.items]);
          setCollagesCursor(collages.nextCursor);
          setHasNextCollagesPage(collages.hasNextPage);
          saveMetadataToCache(
            COLLAGES_CACHE_KEY,
            collages.items,
            true,
            TTL_COLLAGES_REPOSTS_MOMENTS
          );
        }

        if (repostedCollages) {
          setReposts((prev) => [...prev, ...repostedCollages.items]);
          setRepostsCursor(repostedCollages.nextCursor);
          setHasNextRepostsPage(repostedCollages.hasNextPage);
          saveMetadataToCache(
            REPOSTS_CACHE_KEY,
            repostedCollages.items,
            true,
            TTL_COLLAGES_REPOSTS_MOMENTS
          );
        }

        if (moments) {
          setMoments(moments);
          setHasActiveMoments(
            moments.some(
              (moment) => new Date(parseInt(moment.expiresAt)) > new Date()
            )
          );
          saveMetadataToCache(
            MOMENTS_CACHE_KEY,
            moments,
            true,
            TTL_COLLAGES_REPOSTS_MOMENTS
          );
        }
      },
    }
  );

  // Initialization logic
  useEffect(() => {
    const initializeCache = async () => {
      try {
        const cachedProfile = await getMetadataFromCache(PROFILE_CACHE_KEY);
        if (cachedProfile) {
          setAdminProfile(cachedProfile);
          setOriginalAdminProfile(cachedProfile);

          let cachedProfilePictureUri = await getImageFromFileSystem(
            PROFILE_PICTURE_KEY,
            TTL_USER_DATA
          );

          if (!cachedProfilePictureUri) {
            cachedProfilePictureUri = await saveImageToFileSystem(
              PROFILE_PICTURE_KEY,
              cachedProfile.profilePicture,
              true,
              TTL_USER_DATA
            );
          }

          setProfilePictureUri(cachedProfilePictureUri);
        } else {
          fetchAdminProfile();
        }

        const cachedCounts = await getMetadataFromCache(COUNTS_CACHE_KEY);
        if (cachedCounts) {
          setCounts(cachedCounts);
        } else {
          fetchUserCounts();
        }

        const cachedCollages = await getMetadataFromCache(COLLAGES_CACHE_KEY);
        const cachedReposts = await getMetadataFromCache(REPOSTS_CACHE_KEY);
        const cachedMoments = await getMetadataFromCache(MOMENTS_CACHE_KEY);

        if (cachedCollages) setCollages(cachedCollages);
        if (cachedReposts) setReposts(cachedReposts);
        if (cachedMoments) {
          setMoments(cachedMoments);
          setHasActiveMoments(
            cachedMoments.some(
              (moment) => new Date(moment.expiresAt) > new Date()
            )
          );
        }

        if (!cachedCollages || !cachedReposts || !cachedMoments) {
          fetchCollagesRepostsMoments();
        }
      } catch (error) {
        console.error("Error during cache initialization:", error);
      }
    };

    initializeCache();
  }, []);

  // === Fetch More Methods ===

  const fetchMoreCollages = async () => {
    if (!hasNextCollagesPage) return; // Prevent unnecessary fetches

    try {
      const { collages: newCollages } = await fetchCollagesRepostsMoments({
        collagesCursor,
      });

      if (newCollages?.items?.length > 0) {
        setCollages((prevCollages) => [...prevCollages, ...newCollages.items]);
        setCollagesCursor(newCollages.nextCursor);
        setHasNextCollagesPage(newCollages.hasNextPage);

        // Update cache with new collages
        const cachedCollages = await getMetadataFromCache(COLLAGES_CACHE_KEY);
        const updatedCollages = {
          items: [...(cachedCollages?.items || []), ...newCollages.items],
          nextCursor: newCollages.nextCursor,
          hasNextPage: newCollages.hasNextPage,
        };
        await saveMetadataToCache(
          COLLAGES_CACHE_KEY,
          updatedCollages,
          true,
          TTL_COLLAGES_REPOSTS_MOMENTS
        );
      }
    } catch (error) {
      console.error("Error fetching more collages:", error);
    }
  };

  const fetchMoreReposts = async () => {
    if (!hasNextRepostsPage) return; // Prevent unnecessary fetches

    try {
      const { repostedCollages: newReposts } =
        await fetchCollagesRepostsMoments({
          repostsCursor,
        });

      if (newReposts?.items?.length > 0) {
        setReposts((prevReposts) => [...prevReposts, ...newReposts.items]);
        setRepostsCursor(newReposts.nextCursor);
        setHasNextRepostsPage(newReposts.hasNextPage);

        // Update cache with new reposts
        const cachedReposts = await getMetadataFromCache(REPOSTS_CACHE_KEY);
        const updatedReposts = {
          items: [...(cachedReposts?.items || []), ...newReposts.items],
          nextCursor: newReposts.nextCursor,
          hasNextPage: newReposts.hasNextPage,
        };
        await saveMetadataToCache(
          REPOSTS_CACHE_KEY,
          updatedReposts,
          true,
          TTL_COLLAGES_REPOSTS_MOMENTS
        );
      }
    } catch (error) {
      console.error("Error fetching more reposts:", error);
    }
  };

  const updateCachedCounts = async (updatedCounts) => {
    await saveMetadataToCache(
      COUNTS_CACHE_KEY,
      updatedCounts,
      true,
      TTL_USER_COUNTS
    );
  };

  const updateCollageInProfile = async (updatedCollage) => {
    try {
      // Create a new array with the updated collage
      const updatedCollages = collages.map((collage) =>
        collage._id === updatedCollage._id
          ? { ...collage, coverImage: updatedCollage.coverImage }
          : collage
      );

      // Update the state with the new array
      setCollages(updatedCollages);

      // Save the updated collages to the cache
      await saveMetadataToCache(COLLAGES_CACHE_KEY, updatedCollages);

      // Manage thumbnails
      await manageCollageThumbnails();
    } catch (error) {
      console.error("Error updating collage:", error);
    }
  };

  // === Increment/Decrement User Relations Counters ===

  const incrementFollowers = () => {
    setCounts((prev) => {
      const updatedCounts = {
        ...prev,
        followersCount: prev.followersCount + 1,
      };
      updateCachedCounts(updatedCounts);
      return updatedCounts;
    });
  };

  const decrementFollowers = () => {
    setCounts((prev) => {
      const updatedCounts = {
        ...prev,
        followersCount: Math.max(prev.followersCount - 1, 0),
      };
      updateCachedCounts(updatedCounts);
      return updatedCounts;
    });
  };

  const incrementFollowing = () => {
    setCounts((prev) => {
      const updatedCounts = {
        ...prev,
        followingCount: prev.followingCount + 1,
      };
      updateCachedCounts(updatedCounts);
      return updatedCounts;
    });
  };

  const decrementFollowing = () => {
    setCounts((prev) => {
      const updatedCounts = {
        ...prev,
        followingCount: Math.max(prev.followingCount - 1, 0),
      };
      updateCachedCounts(updatedCounts);
      return updatedCounts;
    });
  };

  // === Collage State Management ===

  const addCollage = async (collage) => {
    try {
      // Add the new collage to the state
      const updatedCollages = [...collages, collage];
      setCollages(updatedCollages);

      // Increment the collages count in the state
      setCounts((prevCounts) => ({
        ...prevCounts,
        collagesCount: prevCounts.collagesCount + 1,
      }));

      // Save collages and counts to cache
      await saveMetadataToCache(COLLAGES_CACHE_KEY, updatedCollages);
      await saveMetadataToCache(COUNTS_CACHE_KEY, {
        ...counts,
        collagesCount: counts.collagesCount + 1,
      });

      // Manage thumbnails after adding a collage
      await manageCollageThumbnails();
    } catch (error) {
      console.error("Error adding collage:", error);
    }
  };

  const removeCollage = async (collageId) => {
    try {
      // Remove the collage from the state
      const updatedCollages = collages.filter((c) => c._id !== collageId);
      setCollages(updatedCollages);

      // Decrement the collages count in the state
      setCounts((prevCounts) => ({
        ...prevCounts,
        collagesCount: Math.max(prevCounts.collagesCount - 1, 0),
      }));

      // Save collages and counts to cache
      await saveMetadataToCache(COLLAGES_CACHE_KEY, updatedCollages);
      await saveMetadataToCache(COUNTS_CACHE_KEY, {
        ...counts,
        collagesCount: Math.max(counts.collagesCount - 1, 0),
      });

      // Manage thumbnails after removing a collage
      await manageCollageThumbnails();
    } catch (error) {
      console.error("Error removing collage:", error);
    }
  };

  // === Repost State Management ===

  const addRepost = async (repost) => {
    try {
      // Add the new repost to the state
      const updatedReposts = [...reposts, repost];
      setReposts(updatedReposts);

      // Save reposts to cache
      await saveMetadataToCache(REPOSTS_CACHE_KEY, updatedReposts);

      // Manage thumbnails after adding a repost
      await manageRepostThumbnails();
    } catch (error) {
      console.error("Error adding repost:", error);
    }
  };

  const removeRepost = async (repostId) => {
    try {
      // Remove the repost from the state
      const updatedReposts = reposts.filter((r) => r._id !== repostId);
      setReposts(updatedReposts);

      // Save reposts to cache
      await saveMetadataToCache(REPOSTS_CACHE_KEY, updatedReposts);

      // Manage thumbnails after removing a repost
      await manageRepostThumbnails();
    } catch (error) {
      console.error("Error removing repost:", error);
    }
  };

  // === Moment State Management ===

  const addMoment = async (momentInput) => {
    try {
      // Perform the mutation to create a new moment
      const { data } = await postMomentMutation({
        variables: { cameraShotId: momentInput.cameraShotId },
      });

      if (data?.postMoment?.success) {
        // Create the new moment object
        const moment = {
          _id: data.postMoment._id,
          createdAt: data.postMoment.createdAt,
          expiresAt: data.postMoment.expiresAt,
        };

        // Update the moments state
        const updatedMoments = [...moments, moment];
        setMoments(updatedMoments);

        // Set active moments flag
        setHasActiveMoments(true);

        // Save updated moments to cache
        await saveMetadataToCache(MOMENTS_CACHE_KEY, updatedMoments);
      } else {
        console.error("Failed to add moment:", data?.postMoment?.message);
      }
    } catch (error) {
      console.error("Error posting moment:", error);
      throw new Error("Failed to post moment.");
    }
  };

  const removeMoment = async (momentId) => {
    try {
      // Perform the mutation to delete the moment
      const { data } = await deleteMomentMutation({ variables: { momentId } });

      if (data?.deleteMoment?.success) {
        // Filter the removed moment out of the state
        const updatedMoments = moments.filter((m) => m._id !== momentId);
        setMoments(updatedMoments);

        // Update active moments flag
        const hasActive = updatedMoments.some(
          (m) => new Date(m.expiresAt) > new Date()
        );
        setHasActiveMoments(hasActive);

        // Save updated moments to cache
        await saveMetadataToCache(MOMENTS_CACHE_KEY, updatedMoments);
      } else {
        console.error("Failed to delete moment:", data?.deleteMoment?.message);
      }
    } catch (error) {
      console.error("Error deleting moment:", error);
      throw new Error("Failed to delete moment.");
    }
  };

  // === Thumbnail Caching Helpers ===

  const getCachedThumbnailKeys = async (prefix) => {
    try {
      const keys = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );
      return keys.filter((key) => key.startsWith(prefix));
    } catch (error) {
      console.error("Error retrieving cached thumbnail keys:", error);
      return [];
    }
  };

  const manageThumbnails = async (items, prefix, getImageKey) => {
    const MAX_THUMBNAILS = 15;

    try {
      // Extract the first 15 items
      const prioritizedItems = items.slice(0, MAX_THUMBNAILS);

      // Save thumbnails for the first 15 items
      for (const item of prioritizedItems) {
        const imageKey = getImageKey(item);
        const existingThumbnail = await getImageFromFileSystem(imageKey);

        if (!existingThumbnail) {
          await saveImageToFileSystem(imageKey, item.coverImage);
        }
      }

      // Remove thumbnails not in the first 15
      const cachedKeys = await getCachedThumbnailKeys(prefix);
      const prioritizedKeys = prioritizedItems.map(getImageKey);

      const keysToRemove = cachedKeys.filter(
        (key) => !prioritizedKeys.includes(key)
      );

      for (const key of keysToRemove) {
        const uri = await getImageFromFileSystem(key);
        if (uri) {
          await FileSystem.deleteAsync(uri);
        }
      }
    } catch (error) {
      console.error(`Error managing thumbnails for prefix "${prefix}":`, error);
    }
  };

  const manageCollageThumbnails = async () => {
    await manageThumbnails(
      collages,
      "collage_thumbnail_",
      (collage) => `collage_thumbnail_${collage._id}`
    );
  };

  const manageRepostThumbnails = async () => {
    await manageThumbnails(
      reposts,
      "repost_thumbnail_",
      (repost) => `repost_thumbnail_${repost._id}`
    );
  };

  return (
    <AdminProfileContext.Provider
      value={{
        adminProfile,
        originalAdminProfile,
        profilePictureUri,
        setProfilePictureUri,
        unsavedChanges,
        updateAdminProfileField,
        saveAdminProfile,
        resetAdminChanges,
        isSaving,
        setIsSaving,
        counts,
        collages,
        reposts,
        moments,
        hasActiveMoments,
        collagesCursor,
        repostsCursor,
        hasNextCollagesPage,
        hasNextRepostsPage,
        setCollages,
        setReposts,
        setMoments,
        setCounts,
        setCollagesCursor,
        setRepostsCursor,
        fetchMoreCollages,
        fetchMoreReposts,
        incrementFollowers,
        decrementFollowers,
        incrementFollowing,
        decrementFollowing,
        addCollage,
        removeCollage,
        addRepost,
        removeRepost,
        addMoment,
        removeMoment,
        updateCollageInProfile,
      }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
};

/*   const updateAdminProfileField = (key, value) => {
    setAdminProfile((prev) => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const saveAdminProfile = async () => {
    try {
      const result = await updateAdminDataMutation({
        variables: { ...adminProfile },
      });

      const updatedProfile = result.data.updateUserData.user;

      const profilePictureUri = await saveImageToFileSystem(
        PROFILE_PICTURE_KEY,
        updatedProfile.profilePicture
      );

      const profileWithImage = {
        ...updatedProfile,
        profilePicture: profilePictureUri || updatedProfile.profilePicture,
      };

      setAdminProfile(profileWithImage);
      setOriginalAdminProfile(profileWithImage);

      await saveMetadataToCache(PROFILE_CACHE_KEY, profileWithImage);
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save admin profile:", error);
    }
  }; */
