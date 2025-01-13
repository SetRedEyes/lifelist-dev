import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { lifelistStyles } from "../../../styles/screens/lifelistStyles";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import { useAddExperiencesContext } from "../../../contexts/AddExperiencesContext";
import { useAdminLifeList } from "../../../contexts/AdminLifeListContext";
import ExperienceAddCard from "../../../cards/experience/ExperienceAddCard";
import ButtonIcon from "../../../icons/ButtonIcon";

export default function AddExperiencesOverview() {
  const navigation = useNavigation();
  const { addLifeListExperienceToCache } = useAdminLifeList();
  const route = useRoute();
  const { lifeListId } = route.params;

  const {
    lifeListExperiences,
    updateLifeListExperience,
    removeLifeListExperience,
    resetLifeListExperiences,
  } = useAddExperiencesContext();

  useEffect(() => {
    if (lifeListExperiences.length === 0) {
      navigation.goBack();
    }
  }, [lifeListExperiences.length, navigation]);

  const allExperiencesHaveList = lifeListExperiences.every(
    (exp) => exp.list !== null
  );
  const hasExperiences = lifeListExperiences.length > 0;

  const handleDeleteExperience = (experienceId) => {
    removeLifeListExperience(experienceId);
  };

  const handleAddExperiences = async () => {
    if (!allExperiencesHaveList || !hasExperiences) return;

    try {
      // Batch all experience additions
      const experiencePromises = lifeListExperiences.map(async (exp) => {
        const experiencePayload = {
          lifeListId,
          experience: exp.experience,
          list: exp.list,
          associatedShots: exp.associatedShots,
        };
        return addLifeListExperienceToCache(experiencePayload);
      });

      // Await all promises
      await Promise.all(experiencePromises);

      // Navigate to LifeList after all additions are complete
      navigation.navigate("LifeList");
    } catch (error) {
      console.error("Error adding experiences:", error);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <Pressable
            onPress={handleAddExperiences}
            disabled={!allExperiencesHaveList || !hasExperiences}
          >
            <Text
              style={[
                styles.createButtonText,
                allExperiencesHaveList &&
                  hasExperiences &&
                  styles.createButtonTextActive,
              ]}
            >
              Add
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [
    allExperiencesHaveList,
    hasExperiences,
    lifeListExperiences,
    handleAddExperiences,
    resetLifeListExperiences,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        data={lifeListExperiences}
        renderItem={({ item }) => (
          <ExperienceAddCard
            lifeListExperience={item}
            onListSelect={(newListStatus) =>
              updateLifeListExperience(item.experience._id, {
                list: newListStatus,
              })
            }
            onDelete={handleDeleteExperience}
          />
        )}
        keyExtractor={(item) => item.experience._id}
        contentContainerStyle={lifelistStyles.flatListContentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: 16,
  },
  headerRight: {
    marginRight: 16,
  },
  createButtonText: {
    fontSize: 12,
    color: "#696969",
    fontWeight: "600",
  },
  createButtonTextActive: {
    color: "#6AB952",
    fontWeight: "700",
  },
});
