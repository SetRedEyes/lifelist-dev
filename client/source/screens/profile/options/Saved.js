import React, { useState } from "react";
import { Dimensions, FlatList, View, StyleSheet } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_SAVED_COLLAGES } from "../../../utils/queries/userQueries";
import CollageCard from "../../../cards/collage/CollageCard";
import { layoutStyles } from "../../../styles/components/index";

const { height: screenHeight } = Dimensions.get("window");
const PAGE_SIZE = 24;

export default function Saved() {
  const [savedCollages, setSavedCollages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore } = useQuery(GET_SAVED_COLLAGES, {
    variables: { cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
    onCompleted: (fetchedData) => {
      const { collages, nextCursor, hasNextPage } =
        fetchedData.getSavedCollages;

      // Avoid duplicates by filtering new collages
      const newUniqueCollages = collages.filter(
        (newCollage) =>
          !savedCollages.some((saved) => saved._id === newCollage._id)
      );

      setSavedCollages((prevCollages) => [
        ...prevCollages,
        ...newUniqueCollages,
      ]);
      setCursor(nextCursor);
      setHasMore(hasNextPage);
    },
  });

  const loadMore = async () => {
    if (hasMore && !loading) {
      await fetchMore({
        variables: { cursor, limit: PAGE_SIZE },
      });
    }
  };

  const renderCollageCard = ({ item, index }) => (
    <View style={{ height: screenHeight }}>
      <CollageCard
        collageId={item._id}
        path={item.coverImage}
        index={index}
        collages={savedCollages}
      />
    </View>
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={savedCollages}
        renderItem={renderCollageCard}
        keyExtractor={(item) => item._id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={screenHeight}
        decelerationRate="fast"
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
