import React from "react";
import { Dimensions, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { cardStyles } from "../../styles/components/cardStyles";

const { width } = Dimensions.get("window");
const spacing = 2;
const shotWidth = (width - spacing * 2) / 3;
const shotHeight = (shotWidth * 3) / 2;

export default function CameraShotNavigateCard({
  shot,
  navigation,
  cameraRoll,
  albumShots,
  fromAlbum = false,
  fromExperience = false,
  experienceShots,
  experienceId,
  experienceList,
}) {
  return (
    <Pressable
      onPress={() => {
        if (fromExperience) {
          // Navigate to ViewShotExperience if from an experience
          navigation.navigate("ViewExperienceFeed", {
            shotId: shot._id,
            experienceShots,
            initialIndex: experienceShots.findIndex((s) => s._id === shot._id),
            experienceId,
            experienceList,
          });
        }
        if (fromAlbum) {
          // Navigate to ViewShot
          navigation.navigate("ViewShot", {
            shotId: shot._id,
            albumShots,
            initialIndex: albumShots.findIndex((s) => s._id === shot._id),
            fromAlbum,
          });
        } else {
          navigation.navigate("ViewShot", {
            shotId: shot._id,
            cameraRoll,
            initialIndex: cameraRoll.findIndex((s) => s._id === shot._id),
            fromAlbum,
          });
        }
      }}
      style={[
        cardStyles.cameraShotContainer,
        {
          width: shotWidth,
          height: shotHeight,
          marginRight: spacing,
          marginBottom: spacing,
        },
      ]}
    >
      <View style={cardStyles.shotWrapper}>
        <Image
          source={{ uri: shot.imageThumbnail }}
          style={cardStyles.shotImage}
        />
      </View>
    </Pressable>
  );
}
