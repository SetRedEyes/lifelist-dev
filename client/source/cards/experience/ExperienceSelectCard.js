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
  const { associatedShots = [], _id } = experience; // Default to an empty array if undefined

  useEffect(() => {
    setIsShotAdded(associatedShots.some((shot) => shot._id === shotId));
  }, [associatedShots, shotId]);

  const handleAddRemoveShot = async () => {
    try {
      const updatedShots = isShotAdded
        ? associatedShots.filter((shot) => shot._id !== shotId)
        : [
            ...associatedShots,
            {
              _id: shotId,
              image: currentShot?.image,
              imageThumbnail: currentShot?.imageThumbnail,
            },
          ];

      const updatedExperience = {
        associatedShots: updatedShots,
        lifeListExperienceId: _id,
        list: experience.list,
      };

      await updateLifeListExperienceInCache(updatedExperience);
      setIsShotAdded(!isShotAdded);
    } catch (error) {
      console.error("Failed to update associated shots:", error);
    }
  };

  const confirmRemoveShot = async () => {
    try {
      const updatedShots = associatedShots.filter(
        (shot) => shot._id !== shotId
      );

      const updatedExperience = {
        associatedShots: updatedShots,
        lifeListExperienceId: _id,
        list: experience.list,
      };

      await updateLifeListExperienceInCache(updatedExperience);
      setIsShotAdded(false);
      setIsAlertVisible(false);
    } catch (error) {
      console.error("Failed to remove the shot:", error);
    }
  };

  const getTextColor = () => (isShotAdded ? "#6AB952" : "#fff");

  const handleActionPress = () => {
    if (isShotAdded) {
      setIsAlertVisible(true);
    } else {
      handleAddRemoveShot();
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
            <Text style={cardStyles.secondaryText}>
              Shots: {associatedShots.length} {/* Display shots count */}
            </Text>
          </View>

          {/* Add/Remove Button */}
          <View style={cardStyles.actionButtonSpacer}>
            <SmallGreyButton
              text={isShotAdded ? "Added" : "Add"}
              textColor={getTextColor()}
              onPress={handleActionPress}
              backgroundColor={"#252525"}
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
