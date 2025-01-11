import React, { useEffect, useState } from "react";
import { Pressable, Dimensions, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import {
  getImageFromFileSystem,
  saveImageToFileSystem,
} from "../../utils/caching/cacheHelpers";

const screenWidth = Dimensions.get("window").width;
const spacing = 2; // Gap between images
const imageWidth = (screenWidth - spacing * 4) / 3;

export default function CollageCard({
  collageId,
  path,
  index,
  collages,
  cacheKeyPrefix,
  shouldCache = true, // New prop to control caching
}) {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePress = () => {
    navigation.navigate("CollageStack", {
      screen: "ViewCollage",
      params: { collages, initialIndex: index },
    });
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (shouldCache) {
          const cacheKey = `${cacheKeyPrefix}${collageId}`;
          let uri = await getImageFromFileSystem(cacheKey);

          if (!uri) {
            uri = await saveImageToFileSystem(cacheKey, path);
          }

          setImageUri(uri);
        } else {
          // If caching is disabled, use the direct path
          setImageUri(path);
        }
      } catch (error) {
        console.error(
          `[CollageCard] Error fetching image for ${collageId}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [collageId, path, cacheKeyPrefix, shouldCache]);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: imageWidth, // Ensure each image is square
    height: imageWidth,
    marginRight: spacing, // Right margin for spacing between items
    marginBottom: spacing, // Bottom margin for spacing between rows
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525", // Background color for the card
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
