import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import { useCameraRoll } from "../../../contexts/CameraRollContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import { headerStyles } from "../../../styles/components/headerStyles";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import CameraShotStaticCard from "../../../cards/camera/CameraShotStaticCard";
import MediaPlaceholder from "../components/MediaPlaceholder";
import DangerAlert from "../../../alerts/DangerAlert";

export default function Media() {
  const navigation = useNavigation();
  const route = useRoute();
  const { collage, updateCollage, resetCollage, hasModified } =
    useCreateCollageContext();
  const [showAlert, setShowAlert] = useState(false);

  const {
    shots,
    initializeCameraRollCache,
    loadNextPage,
    isCameraRollCacheInitialized,
  } = useCameraRoll();

  // === Handle collage reset if coming from MainFeed ===
  useEffect(() => {
    if (route.params?.fromMainFeed) {
      resetCollage();
    }
  }, [route.params]);

  // Initialize camera roll cache
  useFocusEffect(() => {
    if (!isCameraRollCacheInitialized) {
      initializeCameraRollCache();
    }
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Media",
      headerTitleStyle: { color: "#fff" },
      headerStyle: { backgroundColor: "#121212" },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={handleBackPress}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="chevron.forward"
            weight="medium"
            onPress={handleNextPage}
            style={symbolStyles.backArrow}
            tintColor={collage.images.length > 0 ? "#6AB952" : "#696969"}
          />
        </View>
      ),
    });
  }, [navigation, collage.images]);

  // Handle back press
  const handleBackPress = () => {
    if (collage.images.length > 3 || hasModified) {
      setShowAlert(true);
    } else {
      navigation.goBack();
    }
  };

  // Confirm alert action
  const handleConfirmAlert = () => {
    resetCollage();
    setShowAlert(false);
    navigation.goBack();
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (id) => {
    const isSelected = collage.images.some((shot) => shot._id === id);
    if (isSelected) {
      updateCollage({
        images: collage.images.filter((shot) => shot._id !== id),
      });
    } else {
      const selectedShot = shots.find((shot) => shot._id === id);
      updateCollage({
        images: [...collage.images, selectedShot],
      });
    }
  };

  // Handle drag-and-drop for image reordering
  const handleDragEnd = ({ data }) => {
    updateCollage({ images: data });
  };

  // Proceed to the next page and set the cover image
  const handleNextPage = () => {
    if (collage.images.length > 0) {
      updateCollage({ coverImage: collage.images[0].imageThumbnail });
      navigation.navigate("Overview");
    }
  };

  // Render a gallery item
  const renderShotItem = ({ item }) => (
    <CameraShotSelectCard
      shot={item}
      isSelected={collage.images.some((shot) => shot._id === item._id)}
      onCheckboxToggle={handleCheckboxToggle}
    />
  );

  // Render a selected image item
  const renderSelectedShot = ({ item, drag }) => (
    <CameraShotStaticCard
      item={item}
      handleImagePress={(id) =>
        updateCollage({
          images: collage.images.filter((shot) => shot._id !== id),
        })
      }
      drag={drag}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={styles.selectedContainer}>
        {collage.images.length === 0 ? (
          <MediaPlaceholder />
        ) : (
          <DraggableFlatList
            data={collage.images}
            renderItem={renderSelectedShot}
            keyExtractor={(item) => item._id.toString()}
            horizontal
            onDragEnd={handleDragEnd}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      <Text style={styles.instructions}>Camera Shots</Text>
      <FlatList
        data={shots}
        renderItem={renderShotItem}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.5}
      />

      <DangerAlert
        visible={showAlert}
        onRequestClose={() => setShowAlert(false)}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to go back?"
        onConfirm={handleConfirmAlert}
        onCancel={() => setShowAlert(false)}
        confirmButtonText="Leave"
        cancelButtonText="Stay"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectedContainer: {
    height: 220,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1C1C1C",
  },
  instructions: {
    margin: 8,
    marginTop: 16,
    color: "#fff",
    fontWeight: "600",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
