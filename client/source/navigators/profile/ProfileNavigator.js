import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { navigatorStyles } from "../../styles/components/navigatorStyles";
import Collages from "../../screens/profile/tabs/Collages";
import Reposts from "../../screens/profile/tabs/Reposts";

export default function ProfileNavigator({
  userId,
  collages,
  reposts,
  fetchMoreCollages,
  fetchMoreReposts,
  navigation,
  hasActiveMoments,
}) {
  const [activeTab, setActiveTab] = useState("Collages");

  const tabs = [
    { name: "Collages", component: Collages },
    { name: "Reposts", component: Reposts },
    ...(hasActiveMoments ? [{ name: "Moments", component: null }] : []), // Dynamically add "Moments" tab
  ];

  const handleTabPress = (tabName) => {
    if (tabName === "Moments") {
      navigation.navigate("Moments", { userId }); // Navigate to Moments
      setActiveTab("Collages"); // Reset activeTab
      return;
    }
    setActiveTab(tabName);
  };

  const renderActiveScreen = () => {
    const activeTabConfig = tabs.find((tab) => tab.name === activeTab);
    if (!activeTabConfig) return null;

    const Component = activeTabConfig.component;
    if (!Component) return null;

    const data = activeTab === "Collages" ? collages : reposts;
    const fetchMore =
      activeTab === "Collages" ? fetchMoreCollages : fetchMoreReposts;

    return <Component userId={userId} data={data} fetchMore={fetchMore} />;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Navigation */}
      <View style={navigatorStyles.profileNavigatorWrapper}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.name}
            style={[
              navigatorStyles.navigatorButton,
              { backgroundColor: "transparent" },
              activeTab === tab.name && navigatorStyles.activeNavigatorButton,
            ]}
            onPress={() => handleTabPress(tab.name)}
          >
            <Text
              style={[
                navigatorStyles.navigatorText,
                activeTab === tab.name && navigatorStyles.activeNavigatorText,
                tab.name === "Moments" && {
                  color: "#5FC4ED",
                  backgroundColor: "transparent",
                }, // Special color for "Moments"
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </View>
      {/* Active Screen */}
      <View style={navigatorStyles.screen}>{renderActiveScreen()}</View>
    </View>
  );
}
