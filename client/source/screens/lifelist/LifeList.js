import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  Animated,
  Text,
  ActivityIndicator,
} from "react-native";
import LifeListOptions from "../../menus/lifelist/LifeListOptions";
import { useNavigation } from "@react-navigation/native";
import CategoryNavigator from "../../navigators/lifelist/CategoryNavigator";
import { useAdminLifeList } from "../../contexts/AdminLifeListContext";
import ButtonIcon from "../../icons/ButtonIcon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { headerStyles } from "../../styles/components";

export default function LifeList() {
  const navigation = useNavigation();
  const [optionsPopupVisible, setOptionsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // AdminLifeListContext hooks
  const { lifeList, initializeLifeListCache, isLifeListCacheInitialized } =
    useAdminLifeList();

  // === Handle Loading State ===
  useEffect(() => {
    if (!isLifeListCacheInitialized) {
      initializeLifeListCache();
    }
  }, [initializeLifeListCache, isLifeListCacheInitialized]);

  useEffect(() => {
    if (isLifeListCacheInitialized && lifeList) {
      setIsLoading(false);
    }
  }, [isLifeListCacheInitialized, lifeList]);

  // === Animate Rotation for Options Button ===
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: optionsPopupVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [optionsPopupVisible]);

  const toggleOptionsPopup = useCallback(() => {
    setOptionsPopupVisible((prev) => !prev);
  }, []);

  const rotation = useMemo(() => {
    return rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"],
    });
  }, [rotateAnim]);

  // === Dynamically Set Header Options ===
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <Text style={styles.headerLeftText}>My LifeList</Text>
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          {/* ListView Button */}
          <ButtonIcon
            name="line.3.horizontal"
            weight="medium"
            onPress={() => navigation.navigate("ListView")}
            style={symbolStyles.listview}
          />

          {/* Options Button with Rotation */}
          <Animated.View
            style={{
              transform: [{ rotate: rotation }],
              marginLeft: 16,
            }}
          >
            <ButtonIcon
              name="ellipsis"
              weight="bold"
              style={symbolStyles.ellipsis}
              onPress={toggleOptionsPopup}
            />
          </Animated.View>
        </View>
      ),
      headerTitle: "",
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerTitleStyle: {
        color: "#fff",
      },
    });
  }, [navigation, rotation, toggleOptionsPopup]);

  // === Render ===
  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6AB952" />
          <Text style={styles.loadingText}>Loading your LifeList...</Text>
        </View>
      ) : lifeList && lifeList.experiences.length > 0 ? (
        <CategoryNavigator lifeList={lifeList} navigation={navigation} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Your LifeList is empty. Start adding experiences!
          </Text>
        </View>
      )}

      <LifeListOptions
        visible={optionsPopupVisible}
        onRequestClose={toggleOptionsPopup}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerLeftText: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: "#bbb",
    fontSize: 18,
    textAlign: "center",
  },
});
