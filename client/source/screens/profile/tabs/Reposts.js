import React, { useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import CollageCard from "../../../cards/collage/CollageCard";
import { containerStyles } from "../../../styles/components";

// Utility to handle mixed ID formats
const getCollageId = (collage) => collage.id || collage._id;

export default function Reposts({ data: collages, fetchMore }) {
  const [loadingMore, setLoadingMore] = useState(false);

  const filteredCollages = collages || [];

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchMore(); // Fetch more data via parent function
    } catch (error) {
      console.error("Error fetching more reposts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderCollageItem = ({ item, index }) => (
    <CollageCard
      collageId={getCollageId(item)}
      path={item.coverImage}
      index={index}
      collages={filteredCollages}
      cacheKeyPrefix="repost_cover_"
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredCollages}
        renderItem={renderCollageItem}
        keyExtractor={(item) => getCollageId(item)}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Trigger when 50% of the remaining list is visible
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
    marginHorizontal: 4, // Spacing between columns
  },
});
