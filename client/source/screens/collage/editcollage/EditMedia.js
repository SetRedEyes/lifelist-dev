import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@apollo/client";
import { GET_CAMERA_SHOTS_BY_IMAGES } from "../../../utils/queries/cameraQueries";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import { useCameraRoll } from "../../../contexts/CameraRollContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import { headerStyles } from "../../../styles/components/headerStyles";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import CameraShotStaticCard from "../../../cards/camera/CameraShotStaticCard";
import MediaPlaceholder from "../../mainfeed/components/MediaPlaceholder";
import DangerAlert from "../../../alerts/DangerAlert";

export default function EditMedia() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { collage, updateCollage, hasModified, setCollages, setCurrentIndex } =
    useCreateCollageContext();
  const [showAlert, setShowAlert] = useState(false);

  // CameraRoll context
  const { shots, loadNextPage, hasNextPage } = useCameraRoll();

  // Fetch collages and currentIndex from params
  useEffect(() => {
    if (params?.collages) {
      setCollages(params.collages);
    }
    if (params?.currentIndex !== undefined) {
      setCurrentIndex(params.currentIndex);
    }
  }, [params, setCollages, setCurrentIndex]);

  // Query to fetch CameraShot details by image URLs
  const { data, loading, error } = useQuery(GET_CAMERA_SHOTS_BY_IMAGES, {
    variables: { images: params.collageData.images },
    skip: !params?.collageData?.images?.length,
  });

  // Preload existing collage data with fetched images
  useEffect(() => {
    if (data) {
      const selectedImages = data.getCameraShotsByImages;
      updateCollage({
        _id: params.collageId,
        caption: params.collageData.caption,
        images: selectedImages,
        coverImage: params.collageData.coverImage,
        taggedUsers: params.collageData.taggedUsers || [],
      });
    }
  }, [data]);

  // Fetch initial camera shots
  useEffect(() => {
    const fetchInitialShots = async () => {
      try {
        await loadNextPage();
      } catch (error) {
        console.error("[EditMedia] Error loading initial shots:", error);
      }
    };
    fetchInitialShots();
  }, [loadNextPage]);

  // Set header options
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Edit Media",
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
    setShowAlert(false);
    navigation.goBack();
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (image) => {
    const isSelected = collage.images.some((shot) => shot.image === image);
    if (isSelected) {
      updateCollage({
        images: collage.images.filter((shot) => shot.image !== image),
      });
    } else {
      const selectedShot =
        shots.find((shot) => shot.image === image) ||
        data?.getCameraShotsByImages.find((shot) => shot.image === image);

      if (selectedShot) {
        updateCollage({
          images: [...collage.images, selectedShot],
        });
      }
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
      navigation.navigate("EditOverview", {
        collageId: params?.collageId,
        collages: params?.collages,
        currentIndex: params?.currentIndex,
      });
    }
  };

  // Render functions
  const renderShotItem = ({ item }) => (
    <CameraShotSelectCard
      shot={item}
      isSelected={collage.images.some((shot) => shot.image === item.image)}
      onCheckboxToggle={() => handleCheckboxToggle(item.image)}
    />
  );

  const renderSelectedShot = ({ item, drag }) => (
    <CameraShotStaticCard
      item={item}
      handleImagePress={() =>
        updateCollage({
          images: collage.images.filter((shot) => shot.image !== item.image),
        })
      }
      drag={drag}
    />
  );

  // Handle loading and error states
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const handleEndReached = () => {
    if (hasNextPage) {
      loadNextPage();
    }
  };

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
        onEndReached={handleEndReached}
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
    justifyContent: "flex-start",
    marginHorizontal: 0,
  },
  flatListContent: {
    flexGrow: 1,
  },
});
