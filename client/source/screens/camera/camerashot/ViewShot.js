import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Text,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCameraRoll } from "../../../contexts/CameraRollContext";
import DangerAlert from "../../../alerts/DangerAlert";
import { cameraStyles } from "../../../styles/screens/cameraStyles";
import CameraShotDisplay from "../../../displays/CameraShotDisplay";
import { headerStyles } from "../../../styles/components/headerStyles";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import ButtonIconWithLabel from "../../../icons/ButtonIconWithLabel";
import * as Sharing from "expo-sharing";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";

const { width } = Dimensions.get("window");
const aspectRatio = 3 / 2;
const imageHeight = width * aspectRatio;

export default function ViewShot() {
  const navigation = useNavigation();
  const route = useRoute();
  const { shotId, albumShots, initialIndex = 0 } = route.params;

  const {
    shots,
    fetchFullResolutionImage,
    preloadFullResolutionImages,
    removeShotFromRoll,
  } = useCameraRoll();

  const shotsFeed = albumShots || shots; // Use albumShots if provided, otherwise use cameraRollShots

  const { addMoment } = useAdminProfile();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentShot, setCurrentShot] = useState(
    shotsFeed[initialIndex] || null
  );
  const [isPostingToMoment, setIsPostingToMoment] = useState(false);
  const [isAdditionalOptionsVisible, setIsAdditionalOptionsVisible] =
    useState(false);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleViewableItemsChanged = useCallback(
    async ({ viewableItems }) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        setCurrentIndex(newIndex);

        await preloadFullResolutionImages(newIndex);

        const shot = shots[newIndex];
        if (shot) {
          const fullResolutionImage = await fetchFullResolutionImage(shot._id);
          setCurrentShot({ ...shot, image: fullResolutionImage });
        }
      }
    },
    [shots, fetchFullResolutionImage, preloadFullResolutionImages]
  );

  const handleDeletePress = () => setIsDeleteAlertVisible(true);

  console.log(currentShot._id);

  const confirmDelete = async () => {
    console.log(currentShot._id);
    try {
      const shotId = currentShot?._id;
      if (shotId) {
        await removeShotFromRoll(shotId);
        const nextIndex =
          shots.length === 1
            ? -1
            : currentIndex === shots.length - 1
            ? currentIndex - 1
            : currentIndex;
        if (nextIndex === -1) {
          navigation.goBack(); // Navigate back if no shots left
        } else {
          setCurrentIndex(nextIndex);
        }
      }
    } catch (error) {
      console.error("Error deleting shot:", error);
      alert("Failed to delete shot.");
    } finally {
      setIsDeleteAlertVisible(false);
    }
  };

  const handlePostToMomentPress = () => setIsPostingToMoment(true);

  const handleConfirmPostToMoment = async () => {
    try {
      if (!currentShot?._id) return;

      await addMoment({ cameraShotId: currentShot._id });

      setFeedbackMessage("Moment successfully posted!");
    } catch (err) {
      console.error("Error posting moment:", err);
      setFeedbackMessage("Failed to post moment.");
    } finally {
      resetToMainButtons();
      setTimeout(() => setFeedbackMessage(""), 2000);
    }
  };

  const handleCancelPostToMoment = () => setIsPostingToMoment(false);

  const handleSharePress = async () => {
    if (!currentShot?.image) return;

    try {
      let imageUri = currentShot.image;

      // If the image is a remote URL, download it to a local file
      if (imageUri.startsWith("http")) {
        const fileName = imageUri.split("/").pop();
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        const { uri } = await FileSystem.downloadAsync(imageUri, fileUri);
        imageUri = uri;
      }

      // Share the local image file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share Camera Shot",
          UTI: "public.jpeg",
        });
      } else {
        alert("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      alert("Failed to share image.");
    }
  };

  const handleAddToPress = () => setIsAdditionalOptionsVisible(true);

  const handleAlbumPress = () => {
    navigation.navigate("AddToAlbums", { shotId: currentShot?._id });
  };

  const handleExperiencePress = () => {
    navigation.navigate("AddToExperiences", {
      shotId: currentShot?._id,
      currentShot: {
        image: currentShot?.image,
        imageThumbnail: currentShot?.imageThumbnail,
      },
    });
  };

  const resetToMainButtons = () => {
    setIsAdditionalOptionsVisible(false);
    setIsPostingToMoment(false);
  };

  if (shots.length === 0) {
    return (
      <View style={cameraStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const date = currentShot
    ? new Date(currentShot.capturedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const time = currentShot
    ? new Date(currentShot.capturedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : "";

  // Set header dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.dateText}>{date}</Text>
          <Text style={headerStyles.timeText}>{time}</Text>
        </View>
      ),
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="xmark"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.xmark}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="trash"
            weight="medium"
            onPress={handleDeletePress}
            style={symbolStyles.trash}
            tintColor={"#E53935"}
          />
        </View>
      ),
    });
  }, [navigation, date, time, handleDeletePress]);

  return (
    <View style={cameraStyles.container}>
      <View style={{ height: imageHeight, marginTop: 16 }}>
        <FlatList
          data={shotsFeed}
          renderItem={({ item }) => (
            <CameraShotDisplay shotId={item._id} imageUrl={item.image} />
          )}
          keyExtractor={(item) => item._id}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          onViewableItemsChanged={handleViewableItemsChanged}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>

      {feedbackMessage ? (
        <View style={cameraStyles.feedbackContainer}>
          <Text style={cameraStyles.feedbackText}>{feedbackMessage}</Text>
        </View>
      ) : (
        <View style={cameraStyles.bottomContainer}>
          {isPostingToMoment ? (
            <>
              <ButtonIconWithLabel
                iconName="checkmark"
                label="Confirm Moment"
                onPress={handleConfirmPostToMoment}
              />
              <ButtonIconWithLabel
                iconName="xmark"
                label="Cancel"
                onPress={handleCancelPostToMoment}
              />
            </>
          ) : isAdditionalOptionsVisible ? (
            <>
              <ButtonIconWithLabel
                iconName="folder"
                label="Album"
                onPress={handleAlbumPress}
              />
              <ButtonIconWithLabel
                iconName="star"
                label="Experience"
                onPress={handleExperiencePress}
              />
              <ButtonIconWithLabel
                iconName="arrow.left"
                label="Back"
                onPress={resetToMainButtons}
              />
            </>
          ) : (
            <>
              <ButtonIconWithLabel
                iconName="paperplane"
                label="Share"
                onPress={handleSharePress}
              />
              <ButtonIconWithLabel
                iconName="rectangle.portrait"
                label="Post Moment"
                onPress={handlePostToMomentPress}
              />
              <ButtonIconWithLabel
                iconName="folder"
                label="Add To"
                onPress={handleAddToPress}
              />
            </>
          )}
        </View>
      )}

      <DangerAlert
        visible={isDeleteAlertVisible}
        onRequestClose={() => setIsDeleteAlertVisible(false)}
        title="Delete Camera Shot"
        message="Are you sure you want to delete this shot?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteAlertVisible(false)}
        cancelButtonText="Discard"
      />
    </View>
  );
}
