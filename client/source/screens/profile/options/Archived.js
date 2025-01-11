import React, { useState } from "react";
import { Dimensions, FlatList, View, StyleSheet } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_ARCHIVED_COLLAGES } from "../../../utils/queries/userQueries";
import CollageCard from "../../../cards/collage/CollageCard";
import { layoutStyles } from "../../../styles/components/index";

const { height: screenHeight } = Dimensions.get("window");
const PAGE_SIZE = 24;

export default function Archived() {
  const [archivedCollages, setArchivedCollages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore } = useQuery(GET_ARCHIVED_COLLAGES, {
    variables: { cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
    onCompleted: (fetchedData) => {
      console.log("fetchedData:", fetchedData);

      const { collages, nextCursor, hasNextPage } =
        fetchedData.getArchivedCollages;

      // Avoid duplicates by filtering new collages
      const newUniqueCollages = collages.filter(
        (newCollage) =>
          !archivedCollages.some((archived) => archived._id === newCollage._id)
      );

      setArchivedCollages((prevCollages) => [
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
        collages={archivedCollages}
      />
    </View>
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={archivedCollages}
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
