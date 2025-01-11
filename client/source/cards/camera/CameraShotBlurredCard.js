import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { fetchCachedImageUri } from "../../utils/caching/cacheHelpers";
import moment from "moment";
import { cardStyles } from "../../styles/components/cardStyles";

const { width } = Dimensions.get("window");
const spacing = 2;
const shotWidth = (width - spacing * 2) / 2;
const shotHeight = (shotWidth * 3) / 2;

export default function CameraShotBlurredCard({
  shot,
  onShotDeveloped,
  onPress,
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDeveloped, setIsDeveloped] = useState(shot.isDeveloped);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const loadImageUri = async () => {
      const cacheKey = `developing_shot_${shot._id}`;
      const cachedUri = await fetchCachedImageUri(
        cacheKey,
        shot.imageThumbnail
      );
      setImageUri(cachedUri);
    };

    loadImageUri();
  }, [shot.imageThumbnail, shot._id]);

  useEffect(() => {
    const now = moment();
    const readyTime = moment(shot.readyToReviewAt);

    if (now.isAfter(readyTime)) {
      setIsDeveloped(true);
      setTimeLeft(null);
      onShotDeveloped(shot._id);
    } else {
      const duration = moment.duration(readyTime.diff(now));
      setIsDeveloped(false);
      setTimeLeft(duration);
    }
  }, [shot.readyToReviewAt]);

  useEffect(() => {
    if (!timeLeft) return;

    const interval = setInterval(() => {
      const now = moment();
      const readyTime = moment(shot.readyToReviewAt);
      const duration = moment.duration(readyTime.diff(now));

      if (duration.asSeconds() <= 0) {
        setIsDeveloped(true);
        setTimeLeft(null);
        clearInterval(interval);
        onShotDeveloped(shot._id);
      } else {
        setTimeLeft(duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, shot.readyToReviewAt]);

  return (
    <Pressable
      onPress={onPress}
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
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={cardStyles.shotImage} />
        ) : (
          <Text style={cardStyles.blurredLoadingText}>Loading...</Text>
        )}
        <BlurView intensity={20} style={cardStyles.blurredOverlay}>
          {!isDeveloped && timeLeft && (
            <Text style={cardStyles.blurredTimerText}>
              {timeLeft.minutes()}:
              {timeLeft.seconds().toString().padStart(2, "0")}
            </Text>
          )}
          {isDeveloped && (
            <Text style={cardStyles.blurredReadyText}>Ready!</Text>
          )}
        </BlurView>
      </View>
    </Pressable>
  );
}
