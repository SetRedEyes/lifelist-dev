import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useCameraAlbums } from "../../../contexts/CameraAlbumContext";
import CameraShotNavigateCard from "../../../cards/camera/CameraShotNavigateCard";
import DangerAlert from "../../../alerts/DangerAlert";
import ButtonIcon from "../../../icons/ButtonIcon";
import {
  layoutStyles,
  headerStyles,
  symbolStyles,
} from "../../../styles/components";

export default function ViewAlbum() {
  const navigation = useNavigation();
  const route = useRoute();
  const { albumId, fromScreen } = route.params;

  const [alertVisible, setAlertVisible] = useState(false);
  const [shots, setShots] = useState([]); // Store paginated shots
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);

  const { albums, fetchPaginatedAlbumShots, removeAlbumFromCache } =
    useCameraAlbums();

  const specificAlbum = albums.find((album) => album._id === albumId);

  // Set header options dynamically
  useEffect(() => {
    if (!specificAlbum) {
      navigation.goBack();
      return;
    }

    navigation.setOptions({
      headerShown: true,
      title: specificAlbum.title || "Album",
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => handleBackPress()} // Handle back press dynamically
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="pencil.line"
            weight="medium"
            onPress={() =>
              navigation.navigate("ManageAlbumShots", {
                albumId, // Pass the current album's ID
                associatedShots: shots, // Pass the current list of shots for this album
              })
            }
            style={symbolStyles.pencil}
          />
          <View style={{ marginLeft: 16 }}>
            <ButtonIcon
              name="trash"
              weight="medium"
              onPress={handleDeleteAlbum} // Open delete confirmation
              style={symbolStyles.trash}
              tintColor={"#E53935"}
            />
          </View>
        </View>
      ),
    });
  }, [
    navigation,
    handleDeleteAlbum,
    specificAlbum,
    albumId,
    shots,
    handleBackPress,
  ]);

  const handleBackPress = () => {
    if (fromScreen === "CreateAlbum") {
      navigation.navigate("CameraRoll"); // Navigate to CameraRoll
    } else {
      navigation.goBack(); // Default behavior
    }
  };

  // Fetch paginated shots
  const loadMoreShots = async () => {
    if (loading || !hasNextPage || !albumId) return;

    setLoading(true);
    try {
      const {
        shots: newShots,
        nextCursor: newCursor,
        hasNextPage: newHasNext,
      } = await fetchPaginatedAlbumShots(albumId, nextCursor);

      if (newShots.length === 0 && !newCursor) return; // Skip updates for empty data

      const uniqueShots = [
        ...shots,
        ...newShots.filter(
          (newShot) => !shots.some((shot) => shot._id === newShot._id)
        ),
      ];

      setShots(uniqueShots);
      setNextCursor(newCursor);
      setHasNextPage(newHasNext);
    } catch (error) {
      console.error("[ViewAlbum] Error loading more shots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reload album shots when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadMoreShots();
    }, [])
  );

  // Handle album deletion
  const handleDeleteAlbum = () => {
    setAlertVisible(true);
  };

  const confirmDeleteAlbum = async () => {
    setAlertVisible(false);
    try {
      // Call the context function to delete the album and update the cache
      await removeAlbumFromCache(albumId);
    } catch (error) {
      console.error("[ViewAlbum] Failed to delete album:", error);
      Alert.alert("Error", "Failed to delete album.");
    }
  };

  // Render individual shots
  const renderShot = ({ item }) => (
    <CameraShotNavigateCard
      shot={item}
      navigation={navigation}
      fromAlbum={true}
      albumShots={shots}
    />
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={shots}
        renderItem={renderShot}
        keyExtractor={(item) => item._id}
        numColumns={3}
        onEndReached={loadMoreShots}
        onEndReachedThreshold={0.5} // Trigger when 50% of the list remains
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#6AB952" /> : null
        }
      />
      <DangerAlert
        visible={alertVisible}
        onRequestClose={() => setAlertVisible(false)}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
        onConfirm={confirmDeleteAlbum}
        onCancel={() => setAlertVisible(false)}
        cancelButtonText="Discard"
      />
    </View>
  );
}
