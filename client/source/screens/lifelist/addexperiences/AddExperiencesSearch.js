import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { useQuery } from "@apollo/client";
import { GET_ALL_EXPERIENCES } from "../../../utils/queries/experienceQueries";
import ExperienceSearchCard from "../../../cards/experience/ExperienceSearchCard";
import DangerAlert from "../../../alerts/DangerAlert";
import ButtonIcon from "../../../icons/ButtonIcon";
import { useAddExperiencesContext } from "../../../contexts/AddExperiencesContext";
import SearchBar from "../../../headers/SearchBar";
import { useAdminLifeList } from "../../../contexts/AdminLifeListContext";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import { lifelistStyles } from "../../../styles/screens/lifelistStyles";
import { useRoute } from "@react-navigation/native";

const LIMIT = 20; // Number of items per page

export default function AddExperiencesSearch({ navigation }) {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allExperiences, setAllExperiences] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const { lifeList } = useAdminLifeList();

  // LifeListExperienceContext methods
  const {
    lifeListExperiences,
    addLifeListExperience,
    removeLifeListExperience,
    resetLifeListExperiences,
    hasModified,
  } = useAddExperiencesContext();

  useEffect(() => {
    if (route.params?.fromScreen === "AddExperiences") {
      resetLifeListExperiences();
    }
  }, [route.params?.fromScreen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data, loading, error, fetchMore } = useQuery(GET_ALL_EXPERIENCES, {
    variables: { cursor: null, limit: LIMIT },
    fetchPolicy: "network-only",
  });

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
          <View style={[styles.searchBarContainer, { marginRight: 16 }]}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onFocusChange={setIsSearchFocused}
            />
          </View>

          {/* Right Button */}
          <ButtonIcon
            name="chevron.forward"
            weight="medium"
            onPress={navigateToOverview}
            disabled={lifeListExperiences.length === 0}
            style={symbolStyles.backArrow} // Add other styles if needed
            tintColor={
              lifeListExperiences.length === 0 ? "#696969" : "#6AB952" // Disabled or Green
            }
          />
        </View>
      ),
    });
  }, [
    navigation,
    searchQuery,
    setSearchQuery,
    navigateToOverview,
    handleBackNavigation,
  ]);

  useEffect(() => {
    if (data?.getAllExperiences) {
      const { experiences, nextCursor: newCursor } = data.getAllExperiences;

      setAllExperiences((prev) => {
        const merged = [...prev, ...experiences];
        // Remove duplicates by _id
        const unique = Array.from(
          new Map(merged.map((item) => [item._id, item])).values()
        );
        return unique;
      });

      setNextCursor(newCursor);
    }
  }, [data]);

  const loadMoreExperiences = () => {
    if (isFetchingMore || !nextCursor) return;
    setIsFetchingMore(true);
    fetchMore({
      variables: { cursor: nextCursor, limit: LIMIT },
      updateQuery: (prev, { fetchMoreResult }) => {
        setIsFetchingMore(false);
        if (!fetchMoreResult) return prev;

        const { experiences, nextCursor: newCursor } =
          fetchMoreResult.getAllExperiences;
        setAllExperiences((prev) => [...prev, ...experiences]);
        setNextCursor(newCursor);
      },
    });
  };

  const filteredExperiences = useMemo(() => {
    if (!debouncedQuery) return [];
    return allExperiences.filter((exp) =>
      exp.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [debouncedQuery, allExperiences]);

  const handleSelect = (experience, isSelected) => {
    if (isSelected) {
      addLifeListExperience(experience);
    } else {
      removeLifeListExperience(experience._id);
    }
  };

  const handleBackNavigation = () => {
    if (lifeListExperiences.length >= 3 || hasModified) {
      setShowAlert(true);
    } else {
      resetLifeListExperiences();
      navigation.goBack();
    }
  };

  const handleConfirmAlert = () => {
    setShowAlert(false);
    resetLifeListExperiences();
    navigation.goBack();
  };

  const navigateToOverview = () => {
    navigation.navigate("AddExperiencesOverview", { lifeListId: lifeList._id });
  };

  return (
    <Pressable
      style={lifelistStyles.listContainer}
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      {filteredExperiences.length === 0 && !loading && (
        <Text style={lifelistStyles.instructionText}>
          No experiences found.
        </Text>
      )}
      <FlatList
        data={filteredExperiences}
        renderItem={({ item }) => (
          <ExperienceSearchCard
            experience={item}
            isSelected={lifeListExperiences.some(
              (exp) => exp.experience._id === item._id
            )}
            onSelect={handleSelect}
            isPreExisting={lifeList.experiences.some(
              (exp) => exp.experience._id === item._id
            )}
          />
        )}
        keyExtractor={(item) => item._id}
        onEndReached={loadMoreExperiences}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore && <Text>Loading more...</Text>}
      />
      <DangerAlert
        visible={showAlert}
        onRequestClose={() => setShowAlert(false)}
        title="Confirm Navigation"
        message="You have made changes. Do you want to save them before leaving?"
        onConfirm={handleConfirmAlert}
        onCancel={() => setShowAlert(false)}
        confirmButtonText="Leave"
        cancelButtonText="Discard"
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
    paddingBottom: 8,
    backgroundColor: "#121212",
  },
  searchBarContainer: {
    flex: 1,
    marginLeft: 16,
  },
});
