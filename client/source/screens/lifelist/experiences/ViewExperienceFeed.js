import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Dimensions, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DangerAlert from "../../../alerts/DangerAlert";
import { headerStyles } from "../../../styles/components/headerStyles";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import CameraShotDisplay from "../../../displays/CameraShotDisplay";
import ButtonIconWithLabel from "../../../icons/ButtonIconWithLabel";
import * as Sharing from "expo-sharing";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useAdminLifeList } from "../../../contexts/AdminLifeListContext";
import { cameraStyles } from "../../../styles/screens/cameraStyles";
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get("window");
const aspectRatio = 3 / 2;
const imageHeight = width * aspectRatio;

export default function ViewExperienceFeed() {
  const navigation = useNavigation();
  const route = useRoute();

  // Extract navigation parameters
  const {
    shotId,
    experienceShots,
    initialIndex = 0,
    experienceId,
    experienceList,
  } = route.params || {};

  // Contexts
  const { addMoment } = useAdminProfile();
  const { updateLifeListExperienceInCache, lifeList } = useAdminLifeList();

  // State variables
  const [currentIndex, setCurrentIndex] = useState(
    experienceShots.findIndex((shot) => shot._id === shotId) || initialIndex
  );
  const [currentShot, setCurrentShot] = useState(
    experienceShots[currentIndex] || null
  );
  const [isPostingToMoment, setIsPostingToMoment] = useState(false);
  const [isAdditionalOptionsVisible, setIsAdditionalOptionsVisible] =
    useState(false);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Handle viewable items change
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        setCurrentIndex(newIndex);
        setCurrentShot(experienceShots[newIndex]);
      }
    },
    [experienceShots]
  );

  // Set header dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.dateText}>
            {currentShot?.capturedAt
              ? new Date(currentShot.capturedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </Text>
          <Text style={headerStyles.timeText}>
            {currentShot?.capturedAt
              ? new Date(currentShot.capturedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })
              : ""}
          </Text>
        </View>
      ),
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="trash"
            onPress={handleDeletePress}
            style={symbolStyles.trash}
            tintColor={"#E53935"}
          />
        </View>
      ),
    });
  }, [navigation, currentShot, handleDeletePress]);

  // Delete shot logic
  const handleDeletePress = () => setIsDeleteAlertVisible(true);

  const confirmDelete = async () => {
    try {
      if (!experienceId || !currentShot) return;

      // Create a new associatedShots array without the current shot
      const updatedShots = experienceShots.filter(
        (shot) => shot._id !== currentShot._id
      );

      // Update the experience in the LifeList context
      const updatedExperience = {
        lifeListExperienceId: experienceId,
        list: experienceList,
        associatedShots: updatedShots,
      };

      await updateLifeListExperienceInCache(updatedExperience);

      // Navigate back to the experience gallery view
      navigation.goBack();
    } catch (error) {
      console.error("Error updating experience:", error);
      alert("Failed to remove the shot.");
    } finally {
      setIsDeleteAlertVisible(false);
    }
  };

  // Post to moment logic
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

  // Share shot logic
  const handleSharePress = async () => {
    if (!currentShot?.image) {
      alert("No image to share.");
      return;
    }

    try {
      let imageUri = currentShot.image;

      // If the image is a remote URL, download it to a local file
      if (imageUri.startsWith("http")) {
        const fileName = imageUri.split("/").pop();
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        const { uri } = await FileSystem.downloadAsync(imageUri, fileUri);
        imageUri = uri;
      }

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        // Share the local image file directly
        await Sharing.shareAsync(imageUri, {
          mimeType: "image/jpeg", // Specify the image MIME type
          dialogTitle: "Share Camera Shot",
          UTI: "public.jpeg", // UTI for image sharing
        });
      } else {
        alert("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      alert("Failed to share image.");
    }
  };

  // Navigation to additional options
  const handleAddToPress = () => setIsAdditionalOptionsVisible(true);

  const handleAlbumPress = () => {
    navigation.navigate("CameraStack", {
      screen: "AddToAlbums", // Target screen within the CameraStack
      params: { shotId: currentShot?._id }, // Pass parameters to AddToAlbums
    });
  };

  const handleExperiencePress = () => {
    navigation.navigate("CameraStack", {
      screen: "AddToExperiences", // Target screen within the CameraStack
      params: {
        shotId: currentShot?._id,
        currentShot: {
          image: currentShot?.image,
          imageThumbnail: currentShot?.imageThumbnail,
        },
      },
    });
  };

  // Reset to main buttons
  const resetToMainButtons = () => {
    setIsAdditionalOptionsVisible(false);
    setIsPostingToMoment(false);
  };

  return (
    <View style={cameraStyles.container}>
      <View style={{ height: imageHeight, marginTop: 16 }}>
        <FlatList
          data={experienceShots}
          renderItem={({ item }) => (
            <CameraShotDisplay shotId={item._id} imageUrl={item.image} />
          )}
          keyExtractor={(item) => item._id}
          horizontal
          pagingEnabled
          initialScrollIndex={currentIndex}
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
                style={{
                  height: 25,
                  width: 24.93,
                }}
              />
              <ButtonIconWithLabel
                iconName="xmark"
                label="Cancel"
                onPress={handleCancelPostToMoment}
                style={{
                  height: 23,
                  width: 22.49,
                }}
              />
            </>
          ) : isAdditionalOptionsVisible ? (
            <>
              <ButtonIconWithLabel
                iconName="folder"
                label="Album"
                onPress={handleAlbumPress}
                style={{
                  height: 20.02,
                  width: 25,
                }}
              />
              <ButtonIconWithLabel
                iconName="star"
                label="Experience"
                onPress={handleExperiencePress}
                style={{
                  height: 25.08,
                  width: 25,
                }}
              />
              <ButtonIconWithLabel
                iconName="arrow.left"
                label="Back"
                onPress={resetToMainButtons}
                style={{
                  height: 20.02,
                  width: 25,
                }}
              />
            </>
          ) : (
            <>
              <ButtonIconWithLabel
                iconName="paperplane"
                label="Share"
                onPress={handleSharePress}
                style={{
                  height: 23.74,
                  width: 24,
                  marginTop: 2,
                }}
              />
              <ButtonIconWithLabel
                iconName="rectangle.portrait.on.rectangle.portrait"
                label="Post Moment"
                onPress={handlePostToMomentPress}
                style={{
                  height: 25.5,
                  width: 21.14,
                }}
              />
              <ButtonIconWithLabel
                iconName="folder"
                label="Add To"
                onPress={handleAddToPress}
                style={{
                  height: 19.96,
                  width: 25,
                }}
              />
            </>
          )}
        </View>
      )}

      <DangerAlert
        visible={isDeleteAlertVisible}
        onRequestClose={() => setIsDeleteAlertVisible(false)}
        title="Remove Shot from Experience"
        message="Are you sure you want to remove this shot from the experience?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteAlertVisible(false)}
        cancelButtonText="Cancel"
      />
    </View>
  );
}
