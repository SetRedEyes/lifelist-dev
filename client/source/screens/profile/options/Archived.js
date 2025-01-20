import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, Text } from "react-native";
import { useQuery } from "@apollo/client";
import { GET_ARCHIVED_COLLAGES } from "../../../utils/queries/userQueries";
import CollageCard from "../../../cards/collage/CollageCard";
import { layoutStyles, containerStyles } from "../../../styles/components";

const PAGE_SIZE = 24;

export default function Archived() {
  const [archivedCollages, setArchivedCollages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore, refetch } = useQuery(
    GET_ARCHIVED_COLLAGES,
    {
      variables: { cursor, limit: PAGE_SIZE },
      fetchPolicy: "network-only",
      onCompleted: (fetchedData) => {
        const { collages, nextCursor, hasNextPage } =
          fetchedData.getArchivedCollages;

        const newUniqueCollages = collages.filter(
          (newCollage) =>
            !archivedCollages.some(
              (archived) => archived._id === newCollage._id
            )
        );

        setArchivedCollages((prevCollages) => [
          ...prevCollages,
          ...newUniqueCollages,
        ]);
        setCursor(nextCursor);
        setHasMore(hasNextPage);
      },
    }
  );

  // Remove a collage from the archived list after unarchiving
  const handleUnarchive = (collageId) => {
    setArchivedCollages((prevCollages) =>
      prevCollages.filter((collage) => collage._id !== collageId)
    );
  };

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
      collages={archivedCollages}
      onUnarchive={() => handleUnarchive(item._id)} // Pass down the unarchive handler
    />
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={archivedCollages}
        renderItem={renderCollageItem}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>
              No archived collages to display.
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
