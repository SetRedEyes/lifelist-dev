import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ButtonIcon from "../../icons/ButtonIcon";
import CollageDisplay from "../../displays/CollageDisplay";
import {
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../../styles/components/index";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function SingleCollage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { collageId } = route.params; // Extract collageId from route params

  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const contentHeight =
    Dimensions.get("window").height - headerHeight - tabBarHeight;

  // Configure the header dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "#fff" },
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
  }, [navigation]);

  return (
    <View style={layoutStyles.wrapper}>
      {/* Render CollageDisplay and let it handle fetching */}
      <View style={[styles.collageContainer, { height: contentHeight }]}>
        <CollageDisplay collageId={collageId} isViewCollageScreen={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collageContainer: {
    width: "100%",
  },
});
