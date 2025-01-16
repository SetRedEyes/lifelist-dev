import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

const { height: screenHeight } = Dimensions.get("window");

export default function MainFeed() {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();

  // Calculate dynamic collage height
  const collageHeight = screenHeight - headerHeight - tabBarHeight;

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // Main feed query
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_MAIN_FEED, {
    variables: { limit: 10 },
  });

  const collages = data?.getMainFeed?.collages || [];
  const hasNextPage = data?.getMainFeed?.hasNextPage || false;
  const nextCursor = data?.getMainFeed?.nextCursor || null;

  // Configure the header options
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <Image
            source={require("../../../assets/branding/lifelist-text.png")}
            style={headerStyles.logo}
            resizeMode="contain"
          />
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
              onPress={() =>
                navigation.navigate("OnboardingStack", {
                  screen: "BucketListOnboarding",
                })
              }
              style={symbolStyles.allMoments}
            />
          </View>
        </View>
      ),
      headerStyle: {
        backgroundColor: "#121212",
      },
    });
  }, [navigation]);

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

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Render collage item
  const renderCollage = useCallback(
    ({ item, index }) => (
      <View style={{ height: collageHeight }}>
        <CollageMainFeedDisplay
          collage={item}
          hasParticipants={item.hasParticipants}
          isAuthor={currentUser._id === item.author._id}
          collages={collages}
          currentIndex={index}
        />
      </View>
    ),
    [collageHeight, currentUser._id, collages]
  );

  if (loading && !data) {
    return <View style={layoutStyles.wrapper} />;
  }

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={collages}
        renderItem={renderCollage}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={collageHeight}
        decelerationRate="fast"
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
