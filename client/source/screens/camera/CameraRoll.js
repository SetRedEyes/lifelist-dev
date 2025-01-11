import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import FormAlert from "../../alerts/FormAlert";
import AlbumCard from "../../cards/camera/AlbumCard";
import CameraShotNavigateCard from "../../cards/camera/CameraShotNavigateCard";
import { useCameraAlbums } from "../../contexts/CameraAlbumContext";
import { useCameraRoll } from "../../contexts/CameraRollContext";
import { cameraStyles } from "../../styles/screens/cameraStyles";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { headerStyles } from "../../styles/components/headerStyles";

export default function CameraRoll() {
  const navigation = useNavigation();
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { albums, initializeAlbumCache, isAlbumCacheInitialized } =
    useCameraAlbums();
  const {
    shots,
    loadNextPage,
    initializeCameraRollCache,
    isCameraRollCacheInitialized,
    hasNextPage,
  } = useCameraRoll();

  // Set header options dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Camera Roll",
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
            onPress={() => navigation.goBack()} // Navigate back
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="folder.badge.plus"
            weight="medium"
            onPress={() => setAlbumModalVisible(true)} // Open album creation modal
            style={symbolStyles.folder}
          />
        </View>
      ),
    });
  }, [navigation, setAlbumModalVisible]);

  // Initialize caches on component mount
  useEffect(() => {
    const initializeCaches = async () => {
      try {
        if (!isAlbumCacheInitialized) await initializeAlbumCache();
        if (!isCameraRollCacheInitialized) await initializeCameraRollCache();
      } catch (error) {
        console.error("[CameraRoll] Error initializing caches:", error);
      }
    };
    initializeCaches();
  }, [isAlbumCacheInitialized, isCameraRollCacheInitialized]);

  // Handle album creation
  const handleCreateAlbum = (title) => {
    setAlbumModalVisible(false);
    navigation.navigate("CreateAlbum", { albumTitle: title });
  };

  // Load more shots when reaching the end of the list
  const loadMoreShots = async () => {
    if (!hasNextPage || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      await loadNextPage();
    } catch (error) {
      console.error("[CameraRoll] Error loading more shots:", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Render the Albums section
  const renderAlbumsSection = () => {
    const hasAlbums = albums.length > 0;

    return (
      <View>
        <Text style={[cameraStyles.headerText, { marginLeft: 8 }]}>Albums</Text>
        {hasAlbums ? (
          <FlatList
            data={albums}
            renderItem={({ item }) => (
              <AlbumCard album={item} navigation={navigation} />
            )}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginLeft: 8 }}
          />
        ) : (
          <Pressable
            style={cameraStyles.placeholderContainer}
            onPress={() => setAlbumModalVisible(true)}
            accessible
            accessibilityLabel="Create Album"
            accessibilityHint="Opens a modal to create a new album."
          >
            <Text style={cameraStyles.placeholderText}>Create Album</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // Render the Shots section
  const renderShotsSection = () => (
    <View style={{ marginTop: 16 }}>
      <Text style={[cameraStyles.headerText, { marginLeft: 8 }]}>
        Camera Shots
      </Text>
      {shots.length > 0 ? (
        <FlatList
          data={shots}
          renderItem={({ item, index }) => (
            <CameraShotNavigateCard
              shot={item}
              navigation={navigation}
              index={index}
            />
          )}
          keyExtractor={(item) => item._id}
          numColumns={3}
          columnWrapperStyle={cameraStyles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            loadMoreShots();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator size="small" color="#6AB952" />
            ) : null
          }
        />
      ) : (
        <Text style={cameraStyles.emptyStateText}>
          No camera shots available.
        </Text>
      )}
    </View>
  );

  // Combine Albums and Shots sections into one FlatList
  const renderMainList = () => (
    <FlatList
      data={[{ key: "albums" }, { key: "shots" }]}
      renderItem={({ item }) =>
        item.key === "albums" ? renderAlbumsSection() : renderShotsSection()
      }
      keyExtractor={(item) => item.key}
      showsVerticalScrollIndicator={false}
      style={{ paddingTop: 12 }}
    />
  );

  return (
    <View style={cameraStyles.container}>
      {/* Form Alert for creating albums */}
      <FormAlert
        visible={albumModalVisible}
        title="New Album"
        subheader="Enter a name for this album."
        onRequestClose={() => setAlbumModalVisible(false)}
        onSave={handleCreateAlbum}
      />

      {/* Main Content */}
      {isAlbumCacheInitialized && isCameraRollCacheInitialized ? (
        renderMainList()
      ) : (
        <View style={cameraStyles.loadingContainer}>
          <Text style={cameraStyles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
}
