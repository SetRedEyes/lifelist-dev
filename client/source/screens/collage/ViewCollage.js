import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Safe area insets
import ButtonIcon from "../../icons/ButtonIcon";
import CollageDisplay from "../../displays/CollageDisplay";
import {
  layoutStyles,
  headerStyles,
  symbolStyles,
} from "../../styles/components";

export default function ViewCollage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { collages, initialIndex } = route.params;

  // Get dynamic heights
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  // Calculate dynamic content height
  const contentHeight =
    Dimensions.get("window").height - headerHeight - tabBarHeight;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Configure the header options
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
    });
  }, [navigation, currentIndex, collages.length]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const renderCollage = useCallback(
    ({ item }) => (
      <View style={[styles.collageContainer, { height: contentHeight }]}>
        <CollageDisplay collageId={item._id} isViewCollageScreen={true} />
      </View>
    ),
    [contentHeight]
  );

  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={collages}
        renderItem={renderCollage}
        keyExtractor={(item) => item._id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={contentHeight}
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: contentHeight,
          offset: contentHeight * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  collageContainer: {
    width: "100%",
  },
});
