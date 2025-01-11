import React, { useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { fetchCachedImageUri } from "../../utils/caching/cacheHelpers";
import { truncateText, capitalizeText } from "../../utils/commonHelpers";
import { cardStyles } from "../../styles/components/cardStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import Icon from "../../icons/Icon";
import { lifelistStyles } from "../../styles/screens/lifelistStyles";

export default function ExperienceCard({
  experience,
  lifeListExperienceId,
  navigation,
}) {
  const [imageUri, setImageUri] = useState(null);

  const cardWidth = lifelistStyles.cardWidth;
  const imageHeight = lifelistStyles.imageHeight;
  const cardHeight = lifelistStyles.cardHeight;

  const truncatedTitle = truncateText(experience.experience.title, 19);
  const capitalizedCategory = capitalizeText(experience.experience.category);

  const hasAssociatedShots =
    Array.isArray(experience.associatedShots) &&
    experience.associatedShots.length > 0;

  useEffect(() => {
    const fetchCachedImage = async () => {
      const cacheKey = `experience_image_${experience._id}`;
      const uri = await fetchCachedImageUri(
        cacheKey,
        experience.experience.image
      );
      setImageUri(uri);
    };
    fetchCachedImage();
  }, [experience]);

  const handleNavigateToDetails = () => {
    navigation.navigate("LifeListStack", {
      screen: "ViewExperience",
      params: { experienceId: lifeListExperienceId },
    });
  };

  return (
    <Pressable
      onPress={handleNavigateToDetails}
      disabled={!hasAssociatedShots}
      style={[{ width: cardWidth }, cardStyles.experienceCardContainer]}
    >
      <View style={{ height: cardHeight }}>
        <Image
          source={{ uri: imageUri }}
          style={[
            cardStyles.imageRadius,
            { height: imageHeight, width: cardWidth },
          ]}
        />
        <View style={cardStyles.textContainerSpacer}>
          <Text style={cardStyles.primaryText}>{truncatedTitle}</Text>
          <View style={cardStyles.secondaryTextContainer}>
            <Text style={cardStyles.secondaryText}>{capitalizedCategory}</Text>
            {hasAssociatedShots && (
              <Icon
                name="photo.on.rectangle"
                style={symbolStyles.photoIcon}
                tintColor="#696969"
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
