import React from "react";
import { View, FlatList } from "react-native";
import ExperienceListCard from "../../../cards/experience/ExperienceListCard";

export default function AllExperiencesList({
  lifeList,
  viewType,
  editMode,
  searchQuery,
  onDelete,
}) {
  const filteredList = lifeList.experiences
    .filter((exp) => exp.list === viewType) // Filter by list type
    .filter((exp) => {
      const title = exp.experience?.title || ""; // Ensure title is always a string
      return title.toLowerCase().includes(searchQuery?.toLowerCase() || "");
    })
    .sort((a, b) => {
      const titleA = a.experience?.title || ""; // Default to empty string if title is missing
      const titleB = b.experience?.title || "";
      return titleA.localeCompare(titleB);
    });

  const renderExperience = ({ item }) => (
    <ExperienceListCard
      lifeListExperienceId={item._id}
      experience={item}
      editMode={editMode}
      onDelete={onDelete}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        data={filteredList}
        renderItem={renderExperience}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
}
