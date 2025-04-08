import React, { useMemo } from "react";
import { Text, View, FlatList } from "react-native";
import { lifelistStyles } from "../../../styles/screens/lifelistStyles";
import ExperienceCard from "../../../cards/experience/ExperienceCard";

const cardWidth = lifelistStyles.cardWidth;
const cardHeight = lifelistStyles.cardHeight;

export default function AllExperiences({ lifeList, navigation }) {
  const sortByTitle = (a, b) =>
    a.experience.title.localeCompare(b.experience.title);

  const experiencedList = useMemo(
    () =>
      lifeList.experiences
        .filter((exp) => exp.list === "EXPERIENCED")
        .sort(sortByTitle),
    [lifeList.experiences]
  );

  const wishListedList = useMemo(
    () =>
      lifeList.experiences
        .filter((exp) => exp.list === "WISHLISTED")
        .sort(sortByTitle),
    [lifeList.experiences]
  );

  const renderExperience = ({ item }) => (
    <ExperienceCard
      experience={item}
      lifeListExperienceId={item._id}
      navigation={navigation}
    />
  );

  const renderPlaceholder = () => (
    <View
      style={[
        lifelistStyles.placeholderCard,
        { width: cardWidth, height: cardHeight },
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
