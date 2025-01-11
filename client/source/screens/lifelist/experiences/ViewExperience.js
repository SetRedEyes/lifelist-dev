import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import CameraShotNavigateCard from "../../../cards/camera/CameraShotNavigateCard";
import ButtonIcon from "../../../icons/ButtonIcon";
import { useAdminLifeList } from "../../../contexts/AdminLifeListContext";
import { symbolStyles } from "../../../styles/components/symbolStyles";

export default function ViewExperience({ route, navigation }) {
  const { experienceId } = route.params;

  // LifeListContext
  const { lifeList } = useAdminLifeList();

  // Find the current experience based on the ID
  const currentExperience = lifeList?.experiences.find(
    (exp) => exp._id === experienceId
  );

  const shots = currentExperience?.associatedShots || [];

  const renderShot = ({ item, index }) => (
    <CameraShotNavigateCard
      shot={item}
      navigation={navigation}
      index={index}
      fromExperience={true}
      experienceShots={shots}
      experienceId={experienceId}
      experienceList={currentExperience.list}
    />
  );

  useEffect(() => {
    if (!currentExperience) return;

    navigation.setOptions({
      headerShown: true,
      title: currentExperience.experience.title || "Experience",
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <ButtonIcon
            name="pencil.line"
            weight="medium"
            onPress={() =>
              navigation.navigate("ManageAssociatedShots", {
                experienceId,
                associatedShots: shots,
              })
            }
            style={symbolStyles.pencil}
          />
        </View>
      ),
    });
  }, [navigation, currentExperience, shots]);

  if (!currentExperience) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Experience...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <FlatList
        data={shots}
        renderItem={renderShot}
        keyExtractor={(item) => item._id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    marginHorizontal: 0,
  },
  headerLeft: {
    marginLeft: 16,
  },
  headerRight: {
    flexDirection: "row",
    marginRight: 16,
  },
});
