import React, { createContext, useContext, useState, useEffect } from "react";
import {
  saveImageToFileSystem,
  getImageFromFileSystem,
} from "../utils/caching/cacheHelpers";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { GET_USER_PROFILE } from "../utils/queries/userQueries";
import {
  FOLLOW_USER,
  UNFOLLOW_USER,
  SEND_FOLLOW_REQUEST,
  UNSEND_FOLLOW_REQUEST,
} from "../utils/mutations/userRelationMutations";
import * as FileSystem from "expo-file-system";

// Constants
const COLLAGE_THUMBNAIL_PREFIX = "collage_thumbnail_";
const REPOST_THUMBNAIL_PREFIX = "repost_thumbnail_";
const MAX_RECENT_PROFILES = 5;

// Context
const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children, userId }) => {
  // === State Management ===
  const [profileData, setProfileData] = useState(null);
  const [collages, setCollages] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [collagesCursor, setCollagesCursor] = useState(null);
  const [repostsCursor, setRepostsCursor] = useState(null);
  const [hasNextCollagesPage, setHasNextCollagesPage] = useState(false);
  const [hasNextRepostsPage, setHasNextRepostsPage] = useState(false);

  // === Queries ===
  const { data, loading, error, refetch } = useQuery(GET_USER_PROFILE, {
    variables: {
      userId,
      collagesCursor: null,
      repostsCursor: null,
      limit: 15,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getUserProfileById) {
      const profile = data.getUserProfileById;
      // Set profile data
      setProfileData(profile);

      // Set collages and reposts
      setCollages(profile.collages.items || []);
      setReposts(profile.repostedCollages.items || []);

      // Update pagination
      setCollagesCursor(profile.collages.nextCursor);
      setRepostsCursor(profile.repostedCollages.nextCursor);
      setHasNextCollagesPage(profile.collages.hasNextPage);
      setHasNextRepostsPage(profile.repostedCollages.hasNextPage);

      // Manage thumbnails
      manageVisitedProfilesThumbnails(profile._id);
      manageThumbnails(
        profile.collages.items,
        COLLAGE_THUMBNAIL_PREFIX,
        profile._id,
        (collage, profileId) =>
          `${COLLAGE_THUMBNAIL_PREFIX}${profileId}_${collage._id}`
      );
      manageThumbnails(
        profile.repostedCollages.items,
        REPOST_THUMBNAIL_PREFIX,
        profile._id,
        (repost, profileId) =>
          `${REPOST_THUMBNAIL_PREFIX}${profileId}_${repost._id}`
      );
    }
  }, [data]);

  const [fetchUserProfileQuery] = useLazyQuery(GET_USER_PROFILE, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.getUserProfileById) {
        const profile = data.getUserProfileById;

        // Log the profile for debugging purposes
        console.log(profile);

        // Set profile data
        setProfileData(profile);

        // Set collages and reposts
        setCollages(profile.collages.items || []);
        setReposts(profile.repostedCollages.items || []);

        // Update pagination
        setCollagesCursor(profile.collages.nextCursor);
        setRepostsCursor(profile.repostedCollages.nextCursor);
        setHasNextCollagesPage(profile.collages.hasNextPage);
        setHasNextRepostsPage(profile.repostedCollages.hasNextPage);

        // Manage thumbnails
        manageVisitedProfilesThumbnails(profile._id);
        manageThumbnails(
          profile.collages.items,
          COLLAGE_THUMBNAIL_PREFIX,
          profile._id,
          (collage, profileId) =>
            `${COLLAGE_THUMBNAIL_PREFIX}${profileId}_${collage._id}`
        );
        manageThumbnails(
          profile.repostedCollages.items,
          REPOST_THUMBNAIL_PREFIX,
          profile._id,
          (repost, profileId) =>
            `${REPOST_THUMBNAIL_PREFIX}${profileId}_${repost._id}`
        );
      }
    },
    onError: (error) => {
      console.error("Error fetching profile data:", error);
    },
  });

  const fetchUserProfile = async (userId) => {
    if (!userId) {
      console.error("fetchUserProfile called without userId");
      return;
    }
    fetchUserProfileQuery({
      variables: {
        userId,
        collagesCursor: null,
        repostsCursor: null,
        limit: 15,
      },
    });
  };

  // === Mutations ===
  const [followUserMutation] = useMutation(FOLLOW_USER);
  const [unfollowUserMutation] = useMutation(UNFOLLOW_USER);
  const [sendFollowRequestMutation] = useMutation(SEND_FOLLOW_REQUEST);
  const [unsendFollowRequestMutation] = useMutation(UNSEND_FOLLOW_REQUEST);

  // === Helper: Retrieve Cached Thumbnail Keys ===
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

  // === Manage Thumbnails for Recently Visited Profiles ===
  const manageVisitedProfilesThumbnails = async (profileId) => {
    try {
      const updatedProfiles = [...recentProfiles, profileId];
      if (updatedProfiles.length > MAX_RECENT_PROFILES) {
        const removedProfile = updatedProfiles.shift();
        await clearProfileThumbnails(removedProfile);
      }
      setRecentProfiles(updatedProfiles);
    } catch (error) {
      console.error("Error managing visited profiles thumbnails:", error);
    }
  };

  // === Clear Profile Thumbnails ===
  const clearProfileThumbnails = async (profileId) => {
    try {
      const collageKeys = await getCachedThumbnailKeys(
        `${COLLAGE_THUMBNAIL_PREFIX}${profileId}_`
      );
      const repostKeys = await getCachedThumbnailKeys(
        `${REPOST_THUMBNAIL_PREFIX}${profileId}_`
      );

      const keysToClear = [...collageKeys, ...repostKeys];

      for (const key of keysToClear) {
        const uri = await getImageFromFileSystem(key);
        if (uri) await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error(
        `Error clearing thumbnails for profile ${profileId}:`,
        error
      );
    }
  };

  // === Manage Thumbnails ===
  const manageThumbnails = async (items, prefix, profileId, getImageKey) => {
    try {
      const MAX_THUMBNAILS = 15;
      const prioritizedItems = items.slice(0, MAX_THUMBNAILS);

      for (const item of prioritizedItems) {
        const imageKey = getImageKey(item, profileId);
        const existingThumbnail = await getImageFromFileSystem(imageKey);

        if (!existingThumbnail) {
          await saveImageToFileSystem(imageKey, item.coverImage);
        }
      }
    } catch (error) {
      console.error(`Error managing thumbnails for prefix "${prefix}":`, error);
    }
  };

  // === Fetch More Collages ===
  const fetchMoreCollages = async () => {
    if (!hasNextCollagesPage) return;

    try {
      refetch({
        collagesCursor,
        repostsCursor: null,
      });
    } catch (error) {
      console.error("Error fetching more collages:", error);
    }
  };

  // === Fetch More Reposts ===
  const fetchMoreReposts = async () => {
    if (!hasNextRepostsPage) return;

    try {
      refetch({
        collagesCursor: null,
        repostsCursor,
      });
    } catch (error) {
      console.error("Error fetching more reposts:", error);
    }
  };

  // === Increment/Decrement Counts ===
  const incrementFollowers = () =>
    setProfileData((prev) => ({
      ...prev,
      followersCount: (prev?.followersCount || 0) + 1,
    }));

  const decrementFollowers = () =>
    setProfileData((prev) => ({
      ...prev,
      followersCount: Math.max((prev?.followersCount || 0) - 1, 0),
    }));

  // === User Relations ===
  // === User Relations ===

  // Follow User
  const followUser = async (targetUserId) => {
    try {
      // Optimistically update the UI
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowing: true,
      }));
      incrementFollowers();

      // Run the mutation
      const { data } = await followUserMutation({
        variables: { userIdToFollow: targetUserId },
      });

      if (!data?.followUser?.success) {
        // Revert if mutation fails
        setProfileData((prevProfile) => ({
          ...prevProfile,
          isFollowing: false,
        }));
        decrementFollowers();
      }
    } catch (error) {
      console.error(`Error following user ${targetUserId}:`, error);
      // Revert if mutation fails
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowing: false,
      }));
      decrementFollowers();
    }
  };

  // Unfollow User
  const unfollowUser = async (targetUserId) => {
    try {
      // Optimistically update the UI
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowing: false,
      }));
      decrementFollowers();

      // Run the mutation
      const { data } = await unfollowUserMutation({
        variables: { userIdToUnfollow: targetUserId },
      });

      if (!data?.unfollowUser?.success) {
        // Revert if mutation fails
        setProfileData((prevProfile) => ({
          ...prevProfile,
          isFollowing: true,
        }));
        incrementFollowers();
      }
    } catch (error) {
      console.error(`Error unfollowing user ${targetUserId}:`, error);
      // Revert if mutation fails
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowing: true,
      }));
      incrementFollowers();
    }
  };

  // Send Follow Request
  const sendFollowRequest = async (targetUserId) => {
    try {
      // Optimistically update the UI
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowRequested: true,
      }));

      // Run the mutation
      const { data } = await sendFollowRequestMutation({
        variables: { userIdToFollow: targetUserId },
      });

      if (!data?.sendFollowRequest?.success) {
        // Revert if mutation fails
        setProfileData((prevProfile) => ({
          ...prevProfile,
          isFollowRequested: false,
        }));
      }
    } catch (error) {
      console.error(
        `Error sending follow request to user ${targetUserId}:`,
        error
      );
      // Revert if mutation fails
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowRequested: false,
      }));
    }
  };

  // Unsend Follow Request
  const unsendFollowRequest = async (targetUserId) => {
    try {
      // Optimistically update the UI
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowRequested: false,
      }));

      // Run the mutation
      const { data } = await unsendFollowRequestMutation({
        variables: { userIdToUnfollow: targetUserId },
      });

      if (!data?.unsendFollowRequest?.success) {
        // Revert if mutation fails
        setProfileData((prevProfile) => ({
          ...prevProfile,
          isFollowRequested: true,
        }));
      }
    } catch (error) {
      console.error(
        `Error canceling follow request for user ${targetUserId}:`,
        error
      );
      // Revert if mutation fails
      setProfileData((prevProfile) => ({
        ...prevProfile,
        isFollowRequested: true,
      }));
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        fetchUserProfile,
        profileData,
        collages,
        reposts,
        collagesCursor,
        repostsCursor,
        hasNextCollagesPage,
        hasNextRepostsPage,
        fetchMoreCollages,
        fetchMoreReposts,
        followUser,
        unfollowUser,
        sendFollowRequest,
        unsendFollowRequest,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
