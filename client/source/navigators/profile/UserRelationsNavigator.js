import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Followers from "../../screens/profile/tabs/Followers";
import Following from "../../screens/profile/tabs/Following";
import { navigatorStyles } from "../../styles/components/navigatorStyles";

const tabs = [
  { name: "Followers", component: Followers },
  { name: "Following", component: Following },
];

export default function UserRelationsNavigator({
  userId,
  initialTab,
  searchQuery,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "Followers");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabPress = (tabName) => {
    if (tabName !== activeTab) {
      setActiveTab(tabName);
    }
  };

  const renderActiveScreen = () => {
    const activeTabConfig = tabs.find((tab) => tab.name === activeTab);
    if (!activeTabConfig) return null;

    return React.createElement(activeTabConfig.component, {
      userId,
      searchQuery,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={navigatorStyles.userRelationsNavigatorWrapper}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.name}
            style={[
              navigatorStyles.navigatorButton,
              navigatorStyles.userRelationsNavigatorButton,
              activeTab === tab.name && navigatorStyles.activeNavigatorButton,
            ]}
            onPress={() => handleTabPress(tab.name)}
          >
            <Text
              style={[
                navigatorStyles.navigatorText,
                activeTab === tab.name && navigatorStyles.activeNavigatorText,
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={navigatorStyles.screen}>{renderActiveScreen()}</View>
    </View>
  );
}
