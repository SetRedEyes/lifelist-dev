import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ListViewNavigator from "../../navigators/lifelist/ListViewNavigator";
import { useAdminLifeList } from "../../contexts/AdminLifeListContext";
import { lifelistStyles } from "../../styles/screens/lifelistStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import SearchBar from "../../headers/SearchBar";
import DangerAlert from "../../alerts/DangerAlert";
import ButtonIcon from "../../icons/ButtonIcon";

export default function ListView() {
  const route = useRoute();
  const navigation = useNavigation();
  const { lifeList, removeLifeListExperienceFromCache } = useAdminLifeList();

  const [editMode, setEditMode] = useState(false);
  const [viewType, setViewType] = useState("EXPERIENCED");
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (route.params?.editMode) {
      setEditMode(true);
    }
  }, [route.params?.editMode]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <View style={styles.headerContainer}>
          {/* Back Button */}
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={handleBackPress}
            style={symbolStyles.backArrow}
          />

          {/* Search Bar */}
          <View
            style={[
              styles.searchBarContainer,
              !editMode && { marginRight: 16 },
            ]}
          >
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onFocusChange={setIsSearchFocused}
            />
          </View>

          {/* Right Button */}
          {!editMode && (
            <ButtonIcon
              name="square.and.pencil"
              weight="medium"
              onPress={toggleEditMode}
              style={symbolStyles.editButton}
            />
          )}
        </View>
      ),
    });
  }, [
    navigation,
    searchQuery,
    setSearchQuery,
    editMode,
    toggleEditMode,
    handleBackPress,
  ]);

  const toggleEditMode = () => setEditMode((prev) => !prev);

  const handleViewTypeChange = (type) => setViewType(type);

  const handleBackPress = () => {
    if (editMode && route.params?.fromScreen === "EditExperiences") {
      navigation.goBack();
    } else if (editMode) {
      setEditMode(false);
    } else {
      navigation.goBack();
    }
  };

  const handleDeleteExperience = (experienceId) => {
    setSelectedExperienceId(experienceId);
    setModalVisible(true);
  };

  const confirmDeleteExperience = async () => {
    try {
      await removeLifeListExperienceFromCache(selectedExperienceId);
    } catch (error) {
      console.error("Failed to remove experience:", error);
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <Pressable
      style={lifelistStyles.container}
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={lifelistStyles.buttonContainer}>
        <Pressable
          style={[
            lifelistStyles.button,
            viewType === "EXPERIENCED" &&
              lifelistStyles.experiencedSelectedButton,
          ]}
          onPress={() => handleViewTypeChange("EXPERIENCED")}
        >
          <Text
            style={[
              lifelistStyles.buttonText,
              viewType === "EXPERIENCED" &&
                lifelistStyles.experiencedSelectedButtonText,
            ]}
          >
            Experienced
          </Text>
        </Pressable>
        <Pressable
          style={[
            lifelistStyles.button,
            viewType === "WISHLISTED" &&
              lifelistStyles.wishlistedSelectedButton,
          ]}
          onPress={() => handleViewTypeChange("WISHLISTED")}
        >
          <Text
            style={[
              lifelistStyles.buttonText,
              viewType === "WISHLISTED" &&
                lifelistStyles.wishlistedSelectedButtonText,
            ]}
          >
            Wish Listed
          </Text>
        </Pressable>
      </View>
      <ListViewNavigator
        lifeList={lifeList}
        viewType={viewType}
        editMode={editMode}
        searchQuery={searchQuery}
        onDelete={handleDeleteExperience}
      />
      <DangerAlert
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
        message="Are you sure you want to delete this experience?"
        onConfirm={confirmDeleteExperience}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 64,
    paddingHorizontal: 16,
    backgroundColor: "#121212",
  },
  backArrow: {
    marginRight: 16,
  },
  searchBarContainer: {
    flex: 1,
    marginLeft: 16,
  },
  searchBarWithBackArrow: {
    marginLeft: 16,
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerLeftText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff", // White text for contrast on dark background
  },
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
  },
});
