import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { useQuery } from "@apollo/client";
import CollageCard from "../../../cards/collage/CollageCard";
import { GET_TAGGED_COLLAGES } from "../../../utils/queries/userQueries";
import { layoutStyles, containerStyles } from "../../../styles/components";

const PAGE_SIZE = 24;

export default function Tagged() {
  const [taggedCollages, setTaggedCollages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore } = useQuery(GET_TAGGED_COLLAGES, {
    variables: { cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
    onCompleted: (fetchedData) => {
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
    <CollageCard
      collageId={item._id}
      path={item.coverImage}
      index={index}
      collages={taggedCollages}
    />
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={taggedCollages}
        renderItem={renderCollageCard}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3} // Display 3 items per row
        columnWrapperStyle={styles.columnWrapper} // Apply styles to rows
        onEndReached={loadMore}
        onEndReachedThreshold={0.5} // Trigger load more when halfway down
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>
              No tagged collages to display.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "flex-start",
    marginHorizontal: 0, // Add spacing between columns
  },
});
