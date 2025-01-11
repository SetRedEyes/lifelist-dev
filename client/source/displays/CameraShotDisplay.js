import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useCameraRoll } from "../contexts/CameraRollContext";
import { displayStyles } from "../styles/components/displayStyles";

export default function CameraShotDisplay({
  shotId,
  imageUrl,
  developingImage = false,
}) {
  const [imageUri, setImageUri] = useState(imageUrl || null);
  const [isFetching, setIsFetching] = useState(false);
  const { fetchFullResolutionImage } = useCameraRoll();

  const fetchImage = useCallback(async () => {
    if (!isFetching && !imageUri) {
      setIsFetching(true);
      try {
        const uri = await fetchFullResolutionImage(shotId);
        setImageUri(uri);
      } catch (error) {
        console.error(
          `[CameraShotDisplay] Error fetching image for ${shotId}:`,
          error
        );
      } finally {
        setIsFetching(false);
      }
    }
  }, [fetchFullResolutionImage, shotId, imageUri, isFetching]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  if (!imageUri) {
    return (
      <View style={displayStyles.imageContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={[displayStyles.imageContainer]}>
      <Image
        source={{ uri: imageUri }}
        style={[
          developingImage ? displayStyles.developingImage : displayStyles.image,
        ]}
      />
    </View>
  );
}
