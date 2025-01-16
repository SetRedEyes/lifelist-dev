import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ButtonIcon from "../../../icons/ButtonIcon";
import ExperienceSelectCard from "../../../cards/experience/ExperienceSelectCard";
import SearchBar from "../../../headers/SearchBar";
import { useAdminLifeList } from "../../../contexts/AdminLifeListContext";
import {
  containerStyles,
  layoutStyles,
  symbolStyles,
} from "../../../styles/components/index";

export default function AddToExperiences() {
  const navigation = useNavigation();
  const route = useRoute();
  const { shotId, currentShot } = route.params;

  const { lifeList, initializeLifeListCache, isLifeListCacheInitialized } =
    useAdminLifeList();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Initialize the LifeList cache on mount
  useEffect(() => {
    const initializeCache = async () => {
      try {
        if (!isLifeListCacheInitialized) await initializeLifeListCache();
      } catch (error) {
        console.error(
          "[AddToExperiences] Error initializing LifeList cache:",
          error
        );
      }
    };
    initializeCache();
  }, [isLifeListCacheInitialized]);

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

  // Filter EXPERIENCED experiences based on search query
  const filteredExperiences = useMemo(() => {
    const experiencedItems =
      lifeList?.experiences?.filter(
        (experience) => experience.list === "EXPERIENCED"
      ) || [];
    if (!searchQuery) return experiencedItems;
    return experiencedItems.filter((experience) =>
      experience.experience.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, lifeList]);

  // Render each experience using `ExperienceSelectCard`
  const renderExperience = ({ item }) => (
    <ExperienceSelectCard
      key={item._id}
      experience={item}
      shotId={shotId}
      currentShot={currentShot}
    />
  );

  if (!isLifeListCacheInitialized) {
    return (
      <View style={containerStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={containerStyles.loadingText}>Loading experiences...</Text>
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
        data={filteredExperiences}
        renderItem={renderExperience}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={containerStyles.emptyContainer}>
            <Text style={containerStyles.emptyText}>No experiences found.</Text>
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
