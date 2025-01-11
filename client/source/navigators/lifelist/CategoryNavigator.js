import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { navigatorStyles } from "../../styles/components/navigatorStyles";
import AllExperiences from "../../screens/lifelist/tabs/AllExperiences";
import CategoryExperiences from "../../screens/lifelist/tabs/CategoryExperiences";

const categories = [
  "All",
  "Attractions",
  "Concerts",
  "Destinations",
  "Events",
  "Festivals",
  "Performers",
  "Resorts",
  "Trails",
  "Venues",
  "Courses",
];

export default function CategoryNavigator({ lifeList, navigation }) {
  const [activeTab, setActiveTab] = useState("All");

  const renderScreen = () => {
    if (activeTab === "All") {
      return <AllExperiences lifeList={lifeList} navigation={navigation} />;
    } else {
      return (
        <CategoryExperiences
          lifeList={lifeList}
          category={activeTab.toUpperCase()}
          navigation={navigation}
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
