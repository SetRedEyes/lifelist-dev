import React, { useMemo } from "react";
import { Text, View, FlatList } from "react-native";
import { lifelistStyles } from "../../../styles/screens/lifelistStyles";
import ExperienceCard from "../../../cards/experience/ExperienceCard";

export default function CategoryExperiences({
  lifeList,
  category,
  navigation,
}) {
  const sortByTitle = (a, b) =>
    a.experience.title.localeCompare(b.experience.title);

  // Filter experiences by category
  const filteredList = useMemo(
    () =>
      lifeList.experiences.filter(
        (exp) => exp.experience.category === category
      ),
    [lifeList.experiences, category]
  );

  // Separate into experienced and wish-listed lists
  const experiencedList = useMemo(
    () =>
      filteredList
        .filter((exp) => exp.list === "EXPERIENCED")
        .sort(sortByTitle),
    [filteredList]
  );

  const wishListedList = useMemo(
    () =>
      filteredList.filter((exp) => exp.list === "WISHLISTED").sort(sortByTitle),
    [filteredList]
  );

  // Render each experience card
  const renderExperience = ({ item }) => (
    <ExperienceCard
      experience={item}
      lifeListExperienceId={item._id}
      navigation={navigation}
    />
  );

  // Render placeholder card for empty states
  const renderPlaceholder = () => (
    <View
      style={[
        lifelistStyles.placeholderCard,
        {
          width: lifelistStyles.cardWidth,
          height: lifelistStyles.cardHeight,
        },
      ]}
    />
  );

  return (
    <View style={lifelistStyles.container}>
      {/* Experienced */}
      <View>
        <Text style={lifelistStyles.headerText}>Experienced</Text>
        <FlatList
          data={experiencedList.length > 0 ? experiencedList : [{}]}
          renderItem={
            experiencedList.length > 0 ? renderExperience : renderPlaceholder
          }
          keyExtractor={(item, index) => item._id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={lifelistStyles.horizontalScroll}
        />
      </View>

      {/* Wish Listed */}
      <View style={lifelistStyles.sectionSpacer}>
        <Text style={lifelistStyles.headerText}>Wish Listed</Text>
        <FlatList
          data={wishListedList.length > 0 ? wishListedList : [{}]}
          renderItem={
            wishListedList.length > 0 ? renderExperience : renderPlaceholder
          }
          keyExtractor={(item, index) => item._id || index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={lifelistStyles.horizontalScroll}
        />
      </View>
    </View>
  );
}
