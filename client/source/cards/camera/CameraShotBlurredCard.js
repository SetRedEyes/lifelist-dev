import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Dimensions } from "react-native";
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
  onRetake, // Pass the retake callback
  onPress,
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDeveloped, setIsDeveloped] = useState(shot.isDeveloped);
  const [imageUri, setImageUri] = useState(null);
  const colorAnim = useRef(new Animated.Value(0)).current; // Animation for the Retake button
  const holdTimeout = useRef(null); // Tracks the hold timer
  const isTriggered = useRef(false); // Tracks whether retake has been triggered

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

  const handleRetakePressIn = () => {
    // Reset the triggered flag
    isTriggered.current = false;

    // Animate color change for the Retake button
    Animated.timing(colorAnim, {
      toValue: 1,
      duration: 2000, // 3 seconds for the full hold
      useNativeDriver: false,
    }).start();

    // Start the hold timer
    holdTimeout.current = setTimeout(() => {
      if (!isTriggered.current && onRetake) {
        isTriggered.current = true; // Ensure it only triggers once
        onRetake(shot._id); // Trigger the retake callback
      }
    }, 2000); // 3 seconds required to trigger the action
  };

  const handleRetakePressOut = () => {
    // Reset the animation and cancel the hold timer if released early
    Animated.timing(colorAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current); // Cancel the timer
    }
  };

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
          {/* Bottom-right: Timer or Ready message */}
          {!isDeveloped && timeLeft ? (
            <Text style={cardStyles.blurredReadyText}>
              {timeLeft.minutes()}:
              {timeLeft.seconds().toString().padStart(2, "0")}
            </Text>
          ) : (
            isDeveloped && (
              <Text style={cardStyles.blurredReadyText}>Ready!</Text>
            )
          )}

          {/* Center: Retake button (only if not ready) */}
          {!isDeveloped && (
            <Pressable
              onPressIn={handleRetakePressIn}
              onPressOut={handleRetakePressOut}
              style={cardStyles.retakeButtonContainer}
            >
              <Animated.View
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 50,
                  backgroundColor: colorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["#25252540", "#6AB952"],
                  }),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}
                >
                  Retake
                </Text>
              </Animated.View>
            </Pressable>
          )}
        </BlurView>
      </View>
    </Pressable>
  );
}
