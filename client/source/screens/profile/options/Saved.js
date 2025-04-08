import React, { useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_SAVED_COLLAGES } from "../../../utils/queries/userQueries";
import CollageCard from "../../../cards/collage/CollageCard";
import { useCollageLists } from "../../../contexts/CollageListsContext"; // Import context
import { layoutStyles, containerStyles } from "../../../styles/components";

const PAGE_SIZE = 24;

export default function Saved() {
  const {
    savedCollages,
    setSavedCollages, // Explicit setter from context
    removeCollageFromContext,
  } = useCollageLists();

  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { loading, fetchMore } = useQuery(GET_SAVED_COLLAGES, {
    variables: { cursor, limit: PAGE_SIZE },
    fetchPolicy: "network-only",
    onCompleted: (fetchedData) => {
      const { collages, nextCursor, hasNextPage } =
        fetchedData.getSavedCollages;

      setSavedCollages(collages); // Populate context state
      setCursor(nextCursor);
      setHasMore(hasNextPage);
    },
  });

  const handleUnsave = (collageId) => {
    removeCollageFromContext("saved", collageId); // Directly update context
  };

  const loadMore = async () => {
    if (hasMore && !loading) {
      await fetchMore({ variables: { cursor, limit: PAGE_SIZE } });
    }
  };

  useEffect(() => {
    return () => {
      setSavedCollages([]); // Clear savedCollages on unmount
    };
  }, []);

  const renderCollageItem = ({ item, index }) => (
    <CollageCard
      collageId={item._id}
      path={item.coverImage}
      index={index}
      collages={savedCollages}
      onUnsave={() => handleUnsave(item._id)}
    />
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={savedCollages}
        renderItem={renderCollageItem}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
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
    marginHorizontal: 0,
  },
});
