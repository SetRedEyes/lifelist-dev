import React, { useEffect, useState } from "react";
import { Pressable, Dimensions, StyleSheet, View } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import {
  getImageFromFileSystem,
  saveImageToFileSystem,
} from "../../utils/caching/cacheHelpers";

const { width: screenWidth } = Dimensions.get("window");
const spacing = 2;
const imageWidth = (screenWidth - spacing * 4) / 3;
const imageHeight = (imageWidth * 3) / 2;

export default function CollageCard({
  collageId,
  path,
  index,
  collages,
  cacheKeyPrefix,
  shouldCache = true,
  onUnarchive,
}) {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePress = () => {
    navigation.navigate("CollageStack", {
      screen: "ViewCollage",
      params: { collages, initialIndex: index, onUnarchive },
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
      {loading ? (
        <SkeletonPlaceholder>
          <View style={[styles.image, styles.skeleton]} />
        </SkeletonPlaceholder>
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: imageWidth,
    height: imageHeight,
    marginRight: spacing,
    marginBottom: spacing,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
