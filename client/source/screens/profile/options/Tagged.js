import React, { useState } from "react";
import { Dimensions, FlatList, View, StyleSheet } from "react-native";
import { useQuery } from "@apollo/client";
import CollageCard from "../../../cards/collage/CollageCard";
import { GET_TAGGED_COLLAGES } from "../../../utils/queries/userQueries";
import { layoutStyles } from "../../../styles/components";

const { height: screenHeight } = Dimensions.get("window");
const PAGE_SIZE = 24;

export default function Tagged() {
  const [taggedCollages, setTaggedCollages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore } = useQuery(GET_TAGGED_COLLAGES, {
    variables: { cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
    onCompleted: (fetchedData) => {
      console.log("fetchedData:", fetchedData);
      const { collages, nextCursor, hasNextPage } =
        fetchedData.getTaggedCollages;

      // Filter for unique collages to avoid duplicates
      const newUniqueCollages = collages.filter(
        (newCollage) =>
          !taggedCollages.some((tagged) => tagged._id === newCollage._id)
      );

      setTaggedCollages((prevCollages) => [
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
        collages={taggedCollages}
      />
    </View>
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={taggedCollages}
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
