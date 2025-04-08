import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@apollo/client";
import { GET_MAIN_FEED } from "../../utils/queries/mainFeedQueries";
import CollageMainFeedDisplay from "../../displays/CollageMainFeedDisplay";
import ButtonIcon from "../../icons/ButtonIcon";
import { useAuth } from "../../contexts/AuthContext";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { Image } from "expo-image";
import { headerStyles } from "../../styles/components/headerStyles";
import { layoutStyles } from "../../styles/components";
import CollageDisplaySkeleton from "../../displays/CollageDisplaySkeleton";
import { useFeedRefresh } from "../../contexts/FeedRefreshContext";

const { height: screenHeight } = Dimensions.get("window");

export default function MainFeed() {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();
  const route = useRoute();

  const { refreshMainFeed, setRefreshMainFeed } = useFeedRefresh();

  // Ref for the FlatList
  const flatListRef = useRef(null);

  // Extract the initialIndex from navigation params
  const initialIndex = route.params?.initialIndex || 0;

  // Calculate dynamic collage height
  const collageHeight = screenHeight - headerHeight - tabBarHeight;

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // Main feed query
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_MAIN_FEED, {
    variables: { limit: 10 },
    fetchPolicy: "network-only", // Ensure data is fetched from the server
  });

  const collages = data?.getMainFeed?.collages || [];
  const hasNextPage = data?.getMainFeed?.hasNextPage || false;
  const nextCursor = data?.getMainFeed?.nextCursor || null;

  // Scroll to top and refetch handler
  const handleLogoPress = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
    refetch();
  }, [refetch]);

  // Handle refreshing when the global `refreshMainFeed` state changes
  useEffect(() => {
    if (refreshMainFeed) {
      console.log("Refreshing MainFeed..."); // Debug: Confirm this is triggered
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true }); // Scroll to top
      }
      refetch().then(() => {
        setRefreshMainFeed(false); // Reset the refresh state only after refetching
      });
    }
  }, [refreshMainFeed, refetch, setRefreshMainFeed]);

  // Configure the header options
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <Pressable onPress={handleLogoPress}>
            <Image
              source={require("../../../assets/branding/echo-white.png")}
              style={headerStyles.logo}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="plus"
            weight="medium"
            onPress={() => navigation.navigate("Media", { fromMainFeed: true })}
            style={symbolStyles.createCollage}
          />
          <View style={{ marginLeft: 16 }}>
            <ButtonIcon
              name="rectangle.portrait.on.rectangle.portrait.angled"
              weight="bold"
              onPress={() => navigation.navigate("EarlyAccessScreen")}
              style={symbolStyles.allMoments}
            />
          </View>
        </View>
      ),
      headerStyle: {
        backgroundColor: "#121212",
      },
    });
  }, [navigation, handleLogoPress]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || !nextCursor) return;

    fetchMore({
      variables: { cursor: nextCursor, limit: 10 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          getMainFeed: {
            ...fetchMoreResult.getMainFeed,
            collages: [
              ...prev.getMainFeed.collages,
              ...fetchMoreResult.getMainFeed.collages,
            ],
          },
        };
      },
    });
  }, [fetchMore, hasNextPage, nextCursor]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (loading && !data) {
    return <View style={layoutStyles.wrapper} />;
  }

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        ref={flatListRef} // Attach the ref here
        data={loading ? Array(5).fill(null) : collages}
        renderItem={({ item, index }) =>
          loading ? (
            <CollageDisplaySkeleton />
          ) : (
            <View style={{ height: collageHeight }}>
              <CollageMainFeedDisplay
                collage={item}
                hasParticipants={item.hasParticipants}
                isAuthor={currentUser === item.author._id}
                collages={collages}
                currentIndex={index}
              />
            </View>
          )
        }
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={collageHeight}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: collageHeight,
          offset: collageHeight * index,
          index,
        })}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6AB952"
            progressViewOffset={0}
          />
        }
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    flexGrow: 1,
  },
});

/*   // Render collage item
  const renderCollage = useCallback(
    ({ item, index }) => (
      <View style={{ height: collageHeight }}>
        <CollageMainFeedDisplay
          collage={item}
          hasParticipants={item.hasParticipants}
          isAuthor={currentUser === item.author._id}
          collages={collages}
          currentIndex={index}
        />
      </View>
    ),
    [collageHeight, currentUser._id, collages]
  ); */
