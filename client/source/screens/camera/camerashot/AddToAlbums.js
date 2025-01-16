import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCameraAlbums } from "../../../contexts/CameraAlbumContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import AlbumSelectCard from "../../../cards/camera/AlbumSelectCard";
import SearchBar from "../../../headers/SearchBar";
import {
  containerStyles,
  layoutStyles,
  symbolStyles,
} from "../../../styles/components/index";

export default function AddToAlbums() {
  const navigation = useNavigation();
  const route = useRoute();
  const { shotId } = route.params;

  const { albums, initializeAlbumCache, isAlbumCacheInitialized, fetchAlbums } =
    useCameraAlbums();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Initialize album cache on mount
  useEffect(() => {
    const initializeCaches = async () => {
      try {
        if (!isAlbumCacheInitialized) await initializeAlbumCache();
        if (isAlbumCacheInitialized) await fetchAlbums();
      } catch (error) {
        console.error("[AddToAlbums] Error initializing caches:", error);
      }
    };
    initializeCaches();
  }, [isAlbumCacheInitialized]);

  const handleBackNavigation = () => {
    navigation.goBack();
  };

  // Update header options
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <View style={styles.headerContainer}>
          {/* Back Button */}
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={handleBackNavigation}
            style={symbolStyles.backArrow}
          />

          {/* Search Bar */}
          <View style={[styles.searchBarContainer, { marginLeft: 16 }]}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onFocusChange={setIsSearchFocused}
            />
          </View>
        </View>
      ),
    });
  }, [navigation, searchQuery, isSearchFocused]);

  // Filter albums based on search query
  const filteredAlbums = useMemo(() => {
    if (!searchQuery) return albums;
    return albums.filter((album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, albums]);

  const renderAlbum = ({ item }) => (
    <AlbumSelectCard key={item._id} album={item} shotId={shotId} />
  );

  if (!isAlbumCacheInitialized) {
    return (
      <View style={containerStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={containerStyles.loadingText}>Loading albums...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        layoutStyles.wrapper,
        {
          paddingHorizontal: 8,
          paddingTop: 8,
        },
      ]}
    >
      <FlatList
        data={filteredAlbums}
        renderItem={renderAlbum}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>No albums found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#121212",
  },
  searchBarContainer: {
    flex: 1,
  },
});
