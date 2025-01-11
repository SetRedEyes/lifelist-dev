import React, { useState } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import CollageCard from "../../../cards/collage/CollageCard";
import { containerStyles } from "../../../styles/components";

// Utility function to handle mixed ID formats
const getCollageId = (collage) => collage.id || collage._id;

export default function Collages({ data: collages, fetchMore }) {
  const [loadingMore, setLoadingMore] = useState(false);

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

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={collages}
        renderItem={renderCollageItem}
        keyExtractor={(item) => getCollageId(item)}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Fetch more data when the user is halfway through the remaining list
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
    marginHorizontal: 4, // Add spacing between columns
  },
});
