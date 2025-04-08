import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import CollageCard from "../../../cards/collage/CollageCard";
import { containerStyles } from "../../../styles/components";

// Utility function to handle mixed ID formats
const getCollageId = (collage) => collage.id || collage._id;

export default function Collages({ data: collages, fetchMore }) {
  const [loadingMore, setLoadingMore] = useState(false);

  // Deduplicate collages by ID
  const deduplicateCollages = (collages) => {
    const seenIds = new Set();
    return collages.filter((collage) => {
      const id = getCollageId(collage);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchMore(); // Trigger the parent function to fetch more data
    } catch (error) {
      console.error("Error fetching more collages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderCollageItem = ({ item, index }) => (
    <CollageCard
      collageId={getCollageId(item)}
      path={item.coverImage}
      index={index}
      collages={collages}
    />
  );

  const deduplicatedCollages = deduplicateCollages(collages);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={deduplicatedCollages}
        renderItem={renderCollageItem}
        keyExtractor={(item) => getCollageId(item)}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>
              No collages to display.
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
    marginHorizontal: 4,
  },
});
