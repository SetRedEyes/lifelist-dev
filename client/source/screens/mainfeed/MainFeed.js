import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // For safe area insets
import { useLazyQuery } from "@apollo/client";
import { GET_MAIN_FEED } from "../../utils/queries/mainFeedQueries";
import ButtonIcon from "../../icons/ButtonIcon";
import { useAuth } from "../../contexts/AuthContext";
import CollageDisplay from "../../displays/CollageDisplay";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { Image } from "expo-image";
import { headerStyles } from "../../styles/components/headerStyles";
import { layoutStyles } from "../../styles/components";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: screenHeight } = Dimensions.get("window");

export default function MainFeed({ route }) {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const headerHeight = useHeaderHeight();

  const [collages, setCollages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate dynamic collage height
  const collageHeight = screenHeight - headerHeight - tabBarHeight;

  const [fetchMainFeed, { loading, error, data, fetchMore }] = useLazyQuery(
    GET_MAIN_FEED,
    {
      fetchPolicy: "cache-and-network",
    }
  );

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

  // Fetch the initial feed data
  useEffect(() => {
    if (currentUser) {
      fetchMainFeed({ variables: { userId: currentUser, page } });
    }
  }, [currentUser, page]);

  // Update collages when new data is fetched
  useEffect(() => {
    if (data) {
      setCollages(data.getMainFeed.collages);
      setHasMore(data.getMainFeed.hasMore);
    }
  }, [data]);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMainFeed({
      variables: { userId: currentUser, page: 1 },
      onCompleted: () => setRefreshing(false),
    });
  };

  // Load more collages when reaching the end of the list
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMore({
        variables: { userId: currentUser, page: page + 1 },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prevResult;
          setPage(page + 1);
          setHasMore(fetchMoreResult.getMainFeed.hasMore);
          return {
            getMainFeed: {
              __typename: prevResult.getMainFeed.__typename,
              collages: [
                ...prevResult.getMainFeed.collages,
                ...fetchMoreResult.getMainFeed.collages,
              ],
              hasMore: fetchMoreResult.getMainFeed.hasMore,
            },
          };
        },
      });
    }
  };

  // Refresh feed when coming back from other screens
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        handleRefresh();
        navigation.setParams({ refresh: false });
      }
    }, [route.params?.refresh])
  );

  const renderCollage = useCallback(
    ({ item }) => (
      <View style={{ height: collageHeight }}>
        <CollageDisplay collageId={item._id} />
      </View>
    ),
    [collageHeight]
  );

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={collages}
        renderItem={renderCollage}
        keyExtractor={(item) => item._id.toString()}
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
  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 80,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  overlayText: {
    color: "white",
    marginTop: 8,
    fontSize: 16,
  },
});
