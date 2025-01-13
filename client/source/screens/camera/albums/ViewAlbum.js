import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList, Alert, ActivityIndicator, Text } from "react-native";
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
  containerStyles,
} from "../../../styles/components";

export default function ViewAlbum() {
  const navigation = useNavigation();
  const route = useRoute();
  const { albumId, fromScreen } = route.params;

  const [alertVisible, setAlertVisible] = useState(false);
  const [shots, setShots] = useState([]);
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
      gestureEnabled: fromScreen !== "CreateAlbum", // Disable gesture if coming from CreateAlbum
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => handleBackPress()}
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
                albumId,
                associatedShots: shots,
              })
            }
            style={symbolStyles.pencil}
          />
          <View style={{ marginLeft: 16 }}>
            <ButtonIcon
              name="trash"
              weight="medium"
              onPress={handleDeleteAlbum}
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
    fromScreen,
  ]);

  const handleBackPress = () => {
    navigation.goBack();
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

      if (newShots.length === 0 && !newCursor) return;

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
      await removeAlbumFromCache(albumId);
      navigation.navigate("CameraRoll");
    } catch (error) {
      console.error("[ViewAlbum] Failed to delete album:", error);
      Alert.alert("Error", "Failed to delete album.");
    }
  };

  // Render individual shots
  const renderShot = ({ item, index }) => (
    <CameraShotNavigateCard
      shot={item}
      index={index}
      navigation={navigation}
      fromAlbum={true}
      albumShots={shots}
    />
  );

  return (
    <View style={layoutStyles.wrapper}>
      {loading ? (
        <View style={containerStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#6AB952" />
          <Text style={containerStyles.loadingText}>
            Loading album shots...
          </Text>
        </View>
      ) : (
        <FlatList
          data={shots}
          renderItem={renderShot}
          keyExtractor={(item) => item._id}
          numColumns={3}
          onEndReached={loadMoreShots}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" color="#6AB952" /> : null
          }
        />
      )}

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
