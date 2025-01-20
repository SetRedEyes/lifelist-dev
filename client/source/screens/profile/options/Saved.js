import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_SAVED_COLLAGES } from "../../../utils/queries/userQueries";
import CollageCard from "../../../cards/collage/CollageCard";
import { layoutStyles, containerStyles } from "../../../styles/components";

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

  const renderCollageItem = ({ item, index }) => (
    <CollageCard
      collageId={item._id}
      path={item.coverImage}
      index={index}
      collages={savedCollages}
    />
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={savedCollages}
        renderItem={renderCollageItem}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3} // Display 3 items per row
        columnWrapperStyle={styles.columnWrapper} // Apply styles to rows
        onEndReached={loadMore}
        onEndReachedThreshold={0.5} // Trigger load more when halfway down
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>
              No saved collages to display.
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
