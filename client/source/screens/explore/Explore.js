import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";
import { useLazyQuery } from "@apollo/client";
import SearchBar from "../../headers/SearchBar";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import ExploreNavigator from "../../navigators/explore/ExploreNavigator";
import UserSearchCard from "../../cards/user/UserSearchCard";
import RecommendedProfileCard from "../../cards/explore/RecommendedProfileCard";
import RecommendedCollageCard from "../../cards/explore/RecommendedCollageCard";
import {
  GET_RECOMMENDED_PROFILES,
  GET_RECOMMENDED_COLLAGES,
} from "../../utils/queries/exploreQueries";
import {
  saveMetadataToCache,
  getMetadataFromCache,
} from "../../utils/caching/cacheHelpers";
import { GET_ALL_USERS } from "../../utils/queries/userQueries";
import { containerStyles } from "../../styles/components";
import SkeletonProfileCard from "../../cards/explore/SkeletonProfileCard";
import SkeletonCollageCard from "../../cards/explore/SkeletonCollageCard";

const screenWidth = Dimensions.get("window").width;

const SEARCH_CACHE_KEY = "explore_search_cache";
const RECENTLY_SEEN_PROFILES = "recently_seen_profiles";
const RECENTLY_SEEN_COLLAGES = "recently_seen_collages";
const MAX_CACHE_SIZE = 24;
const MAX_RECENTLY_SEEN = 10;

export default function Explore({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("All"); // Current tab
  const [isRefreshing, setIsRefreshing] = useState(false); // Refresh state
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchBarRef = useRef(null);
  const translateX = useRef(new Animated.Value(0)).current;

  // User search state
  const [users, setUsers] = useState([]);
  const [userCursor, setUserCursor] = useState(null);
  const [userHasNextPage, setUserHasNextPage] = useState(true);
  const [cachedUsers, setCachedUsers] = useState([]); // Cached search results

  // Recommended Profiles state
  const [profiles, setProfiles] = useState([]);
  const [profileCursor, setProfileCursor] = useState(null);
  const [profileHasNextPage, setProfileHasNextPage] = useState(true);
  const [recentlySeenProfiles, setRecentlySeenProfiles] = useState([]);

  // Recommended Collages state
  const [collages, setCollages] = useState([]);
  const [collageCursor, setCollageCursor] = useState(null);
  const [collageHasNextPage, setCollageHasNextPage] = useState(true);
  const [recentlySeenCollages, setRecentlySeenCollages] = useState([]);

  // Queries
  const [loadUsers, { loading: userLoading }] = useLazyQuery(GET_ALL_USERS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.getAllUsers) {
        const { users: newUsers, hasNextPage, nextCursor } = data.getAllUsers;

        setUsers((prevUsers) => {
          const userMap = new Map();
          [...prevUsers, ...newUsers].forEach((user) =>
            userMap.set(user.user._id, user)
          );
          return Array.from(userMap.values());
        });
        setUserHasNextPage(hasNextPage);
        setUserCursor(nextCursor);
      }
    },
    onError: (error) => {
      console.error("Error fetching users:", error);
    },
  });

  const [loadProfiles, { loading: profileLoading }] = useLazyQuery(
    GET_RECOMMENDED_PROFILES,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data?.getRecommendedProfiles) {
          const {
            profiles: newProfiles,
            hasNextPage,
            nextCursor,
          } = data.getRecommendedProfiles;

          setProfiles((prevProfiles) => {
            const profileMap = new Map();
            [...prevProfiles, ...newProfiles].forEach((profile) =>
              profileMap.set(profile._id, profile)
            );
            return Array.from(profileMap.values());
          });
          setProfileHasNextPage(hasNextPage);
          setProfileCursor(nextCursor);
        }
      },
      onError: (error) => {
        console.error("Error fetching recommended profiles:", error);
      },
    }
  );

  const [loadCollages, { loading: collageLoading }] = useLazyQuery(
    GET_RECOMMENDED_COLLAGES,
    {
      fetchPolicy: "network-only",
      onCompleted: async (data) => {
        if (data?.getRecommendedCollages) {
          const {
            collages: newCollages,
            hasNextPage,
            nextCursor,
          } = data.getRecommendedCollages;

          setCollages((prevCollages) => {
            const collageMap = new Map();
            [...prevCollages, ...newCollages].forEach((collage) =>
              collageMap.set(collage._id, collage)
            );
            return Array.from(collageMap.values());
          });

          // Reset recentlySeenCollages before updating with new collages
          setRecentlySeenCollages([]);
          await saveMetadataToCache(RECENTLY_SEEN_COLLAGES, []);

          // Add collages to recently seen and cache
          const newCollageIds = newCollages.map((collage) =>
            collage._id.toString()
          );
          setRecentlySeenCollages(newCollageIds);
          await saveMetadataToCache(RECENTLY_SEEN_COLLAGES, newCollageIds);

          setCollageHasNextPage(hasNextPage);
          setCollageCursor(nextCursor);
        }
      },
      onError: (error) => {
        console.error("Error fetching recommended collages:", error);
      },
    }
  );

  // Load cached metadata on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      const cachedData = await getMetadataFromCache(SEARCH_CACHE_KEY);
      const recentlySeenProfiles = await getMetadataFromCache(
        RECENTLY_SEEN_PROFILES
      );
      const recentlySeenCollages = await getMetadataFromCache(
        RECENTLY_SEEN_COLLAGES
      );

      if (cachedData) setCachedUsers(cachedData);
      if (recentlySeenProfiles) setRecentlySeenProfiles(recentlySeenProfiles);
      if (recentlySeenCollages) setRecentlySeenCollages(recentlySeenCollages);
    };

    loadInitialData();
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        setUsers([]); // Clear users before new search
        loadUsers({
          variables: { searchQuery, limit: 10, cursor: null },
        });
      } else {
        setUsers([]);
      }
    }, 300); // Debounce delay: 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchFocusChange = (isFocused) => setIsFocused(isFocused);

  const fetchMoreUsers = () => {
    if (userHasNextPage && !userLoading && userCursor) {
      loadUsers({
        variables: { searchQuery, limit: 10, cursor: userCursor },
      });
    }
  };

  const fetchMoreProfiles = () => {
    if (profileHasNextPage && !profileLoading) {
      loadProfiles({
        variables: { cursor: profileCursor, limit: 10, recentlySeenProfiles },
      });
    }
  };

  const fetchMoreCollages = () => {
    if (collageHasNextPage && !collageLoading) {
      loadCollages({
        variables: {
          cursor: collageCursor,
          limit: 10,
          recentlySeen: recentlySeenCollages,
        },
      });
    }
  };

  const cacheVisitedProfile = async (profile) => {
    // Check if profile is already cached
    const updatedCache = [
      profile,
      ...cachedUsers.filter(
        (cachedUser) => cachedUser.user._id !== profile.user._id
      ),
    ];

    // Limit the cache size to MAX_CACHE_SIZE
    const limitedCache = updatedCache.slice(0, MAX_CACHE_SIZE);

    // Update state and save to persistent storage
    setCachedUsers(limitedCache);
    await saveMetadataToCache(SEARCH_CACHE_KEY, limitedCache);
  };

  const handleProfileView = async (profile) => {
    navigation.navigate("ProfileStack", {
      screen: "Profile",
      params: { userId: profile._id },
    });

    const updatedRecentlySeen = [
      profile._id,
      ...recentlySeenProfiles.filter((id) => id !== profile._id),
    ].slice(0, MAX_RECENTLY_SEEN);

    setRecentlySeenProfiles(updatedRecentlySeen);
    await saveMetadataToCache(RECENTLY_SEEN_PROFILES, updatedRecentlySeen);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear previous data
      setProfiles([]);
      setCollages([]);
      setUserCursor(null);
      setProfileCursor(null);
      setCollageCursor(null);

      // Fetch new data
      await Promise.all([
        loadProfiles({
          variables: {
            cursor: null,
            limit: 10,
            recentlySeen: recentlySeenProfiles,
          },
        }),
        loadCollages({
          variables: {
            cursor: null,
            limit: 10,
            recentlySeen: recentlySeenCollages,
          },
        }),
      ]);

      // Clear recently seen collages cache
      await saveMetadataToCache(RECENTLY_SEEN_COLLAGES, []);
    } catch (error) {
      console.error("Error refreshing explore data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles({
      variables: {
        cursor: null,
        limit: 10,
        recentlySeen: recentlySeenProfiles,
      },
    });
    loadCollages({
      variables: {
        cursor: null,
        limit: 10,
        recentlySeen: recentlySeenCollages,
      },
    });
  }, []);

  const handleBackPress = () => {
    if (searchBarRef.current) {
      searchBarRef.current.blur(); // Ensure keyboard is dismissed
    }

    // Reset search state after blurring
    setTimeout(() => {
      setSearchQuery("");
      setUsers([]);
      setIsSearchActive(false);
    }, 25);
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <View style={styles.headerContainer}>
          {isSearchActive && (
            <ButtonIcon
              name="chevron.backward"
              weight="medium"
              onPress={handleBackPress}
              style={symbolStyles.backArrow}
            />
          )}
          <View
            style={[
              styles.searchBarContainer,
              isSearchActive && styles.searchBarWithBackArrow,
            ]}
          >
            <SearchBar
              ref={searchBarRef}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onFocusChange={() => setIsSearchActive(true)}
            />
          </View>
        </View>
      ),
    });
  }, [
    navigation,
    isFocused,
    searchQuery,
    setIsFocused,
    setSearchQuery,
    setIsSearchActive,
    isSearchActive,
    handleBackPress,
  ]);

  return (
    <Pressable style={{ flex: 1, backgroundColor: "#121212" }}>
      {isSearchActive ? (
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateX }], // Animate swipe
          }}
        >
          <ExploreNavigator activeTab={activeTab} setActiveTab={setActiveTab} />
          {searchQuery.trim() === "" ? (
            <FlatList
              data={cachedUsers}
              keyExtractor={(item) => item.user._id.toString()}
              renderItem={({ item }) => (
                <UserSearchCard
                  user={item}
                  navigation={navigation}
                  cacheVisitedProfile={cacheVisitedProfile}
                />
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={containerStyles.emptyContainer}>
                  <Text style={containerStyles.emptyText}>
                    No recently visited profiles.
                  </Text>
                </View>
              }
              style={{ marginHorizontal: 8 }}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item) => item.user._id.toString()}
              renderItem={({ item }) => (
                <UserSearchCard
                  user={item}
                  navigation={navigation}
                  cacheVisitedProfile={cacheVisitedProfile}
                />
              )}
              onEndReached={fetchMoreUsers}
              onEndReachedThreshold={0.8}
              style={{ marginHorizontal: 8 }}
              ListFooterComponent={
                userLoading && (
                  <View style={{ marginTop: 32 }}>
                    <ActivityIndicator size="small" color="#6AB952" />
                  </View>
                )
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </Animated.View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={[]}
            keyExtractor={(_, index) => index.toString()}
            ListHeaderComponent={
              <>
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
                  Recommended Profiles
                </Text>
                <FlatList
                  data={profileLoading ? Array(5).fill(null) : profiles}
                  horizontal
                  keyExtractor={(item, index) =>
                    item?._id?.toString() || index.toString()
                  }
                  renderItem={({ item }) =>
                    profileLoading ? (
                      <SkeletonProfileCard />
                    ) : (
                      <RecommendedProfileCard
                        user={item}
                        onPress={() => handleProfileView(item)}
                      />
                    )
                  }
                  onEndReached={fetchMoreProfiles}
                  onEndReachedThreshold={0.8}
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingLeft: 16 }}
                />
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                  Recommended Collages
                </Text>
              </>
            }
            ListFooterComponent={
              <FlatList
                data={collageLoading ? Array(9).fill(null) : collages}
                keyExtractor={(item, index) =>
                  item?._id?.toString() || index.toString()
                }
                renderItem={({ item, index }) =>
                  collageLoading ? (
                    <SkeletonCollageCard />
                  ) : (
                    <RecommendedCollageCard
                      collage={item}
                      collages={collages}
                      index={index}
                    />
                  )
                }
                numColumns={3}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                onEndReached={fetchMoreCollages}
                onEndReachedThreshold={0.8}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#121212",
  },
  backArrow: {
    marginRight: 16, // Space between the back arrow and the search bar
  },
  searchBarContainer: {
    flex: 1, // Default search bar takes full width
    transition: "flex 0.5s", // Smooth transition when resizing
  },
  searchBarWithBackArrow: {
    marginLeft: 16,
  },
  searchActiveContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    marginLeft: 16,
  },
  columnWrapper: {
    justifyContent: "flex-start",
  },
});
