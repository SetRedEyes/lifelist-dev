import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { navigatorStyles } from "../../styles/components/navigatorStyles";
import AllExperiencesList from "../../screens/lifelist/tabs/AllExperiencesList";
import CategoryExperiencesList from "../../screens/lifelist/tabs/CategoryExperiencesList";

const categories = [
  "All",
  "Attractions",
  "Concerts",
  "Destinations",
  "Events",
  "Courses",
  "Venues",
  "Festivals",
  "Trails",
  "Resorts",
  "Performers",
];

export default function ListViewNavigator({
  lifeList,
  viewType,
  editMode,
  searchQuery,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("All");

  const renderScreen = () => {
    if (activeTab === "All") {
      return (
        <AllExperiencesList
          lifeList={lifeList}
          viewType={viewType}
          editMode={editMode}
          searchQuery={searchQuery}
          onDelete={onDelete}
        />
      );
    } else {
      return (
        <CategoryExperiencesList
          lifeList={lifeList}
          category={activeTab.toUpperCase()}
          viewType={viewType}
          editMode={editMode}
          searchQuery={searchQuery}
          onDelete={onDelete}
        />
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={navigatorStyles.listViewNavigatorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: 6 }}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                navigatorStyles.navigatorButton,
                navigatorStyles.listViewNavigatorButton,
                activeTab === category && navigatorStyles.activeNavigatorButton,
              ]}
              onPress={() => setActiveTab(category)}
            >
              <Text
                style={[
                  navigatorStyles.navigatorText,
                  activeTab === category && navigatorStyles.activeNavigatorText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
    </View>
  );
}
