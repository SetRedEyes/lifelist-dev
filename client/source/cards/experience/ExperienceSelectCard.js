import React, { useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { truncateText, capitalizeText } from "../../utils/commonHelpers";
import { useAdminLifeList } from "../../contexts/AdminLifeListContext";
import SmallGreyButton from "../../buttons/SmallGreyButton";
import DangerAlert from "../../alerts/DangerAlert";
import { cardStyles } from "../../styles/components/cardStyles";

export default function ExperienceSelectCard({
  experience,
  shotId,
  currentShot,
}) {
  const { updateLifeListExperienceInCache } = useAdminLifeList();
  const [isShotAdded, setIsShotAdded] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const imageUrl = experience.experience.image;
  const truncatedTitle = truncateText(experience.experience.title, 40);
  const capitalizedCategory = capitalizeText(experience.experience.category);
  const { _id, associatedShots } = experience;

  useEffect(() => {
    setIsShotAdded(associatedShots.some((shot) => shot._id === shotId));
  }, [associatedShots, shotId]);

  const handleAddRemoveShot = async () => {
    try {
      // Add or remove the shot with its details
      const updatedShots = isShotAdded
        ? associatedShots.filter((shot) => shot._id !== shotId)
        : [
            ...associatedShots,
            {
              _id: shotId,
              image: currentShot?.image, // Include the full-resolution image
              imageThumbnail: currentShot?.imageThumbnail, // Include the thumbnail
            },
          ];

      console.log("experience._id,", experience._id);

      // Construct the updated experience object
      const updatedExperience = {
        associatedShots: updatedShots, // Update associated shots
        lifeListExperienceId: experience._id, // Ensure lifeListExperienceId is passed
        list: experience.list, // Ensure list type is included
      };

      // Call the update function
      await updateLifeListExperienceInCache(updatedExperience);

      // Update local state
      setIsShotAdded(!isShotAdded);
    } catch (error) {
      console.error("Failed to update associated shots:", error);
    }
  };

  const confirmRemoveShot = async () => {
    try {
      // Filter out the shot to remove
      const updatedShots = associatedShots.filter(
        (shot) => shot._id !== shotId
      );

      // Construct the updated experience object
      const updatedExperience = {
        associatedShots: updatedShots, // Updated associated shots
        lifeListExperienceId: experience._id, // Pass the correct experience ID
        list: experience.list, // Ensure list type is included
      };

      // Call the update function with the updated experience object
      await updateLifeListExperienceInCache(updatedExperience);

      // Update local state
      setIsShotAdded(false); // Ensure the button reflects the removal
      setIsAlertVisible(false); // Close the alert
    } catch (error) {
      console.error("Failed to remove the shot:", error);
    }
  };

  const getTextColor = () => (isShotAdded ? "#6AB952" : "#fff");

  const handleActionPress = () => {
    if (isShotAdded) {
      setIsAlertVisible(true); // Show DangerAlert if removing
    } else {
      handleAddRemoveShot(); // Directly add the shot
    }
  };

  return (
    <>
      <Pressable style={cardStyles.listItemContainer}>
        <View style={cardStyles.contentContainer}>
          {/* Experience Image */}
          <Image source={{ uri: imageUrl }} style={cardStyles.imageMd} />

          {/* Text Content */}
          <View style={cardStyles.textContainer}>
            <Text style={cardStyles.primaryText}>{truncatedTitle}</Text>
            <Text style={cardStyles.secondaryText}>{capitalizedCategory}</Text>
          </View>

          {/* Add/Remove Button */}
          <View style={cardStyles.actionButtonSpacer}>
            <SmallGreyButton
              text={isShotAdded ? "Added" : "Add"}
              textColor={getTextColor()}
              onPress={handleActionPress}
            />
          </View>
        </View>
      </Pressable>

      {/* DangerAlert */}
      <DangerAlert
        visible={isAlertVisible}
        onRequestClose={() => setIsAlertVisible(false)}
        message="Are you sure you want to remove this shot?"
        onConfirm={confirmRemoveShot}
      />
    </>
  );
}
