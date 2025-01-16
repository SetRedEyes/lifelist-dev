import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import { layoutStyles, iconStyles } from "../../../styles/components";
import Icon from "../../../icons/Icon";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER_MOMENTS } from "../../../utils/queries/momentQueries";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useAuth } from "../../../contexts/AuthContext";
import DangerAlert from "../../../alerts/DangerAlert";
import ButtonIcon from "../../../icons/ButtonIcon";
import { headerStyles, symbolStyles } from "../../../styles/components";
import {
  MARK_MOMENT_AS_VIEWED,
  LIKE_MOMENT,
  UNLIKE_MOMENT,
} from "../../../utils/mutations/momentMutations";

const { width } = Dimensions.get("window");
const aspectRatio = 3 / 2;
const imageHeight = width * aspectRatio;
const MOMENT_DURATION = 10000; // 10 seconds

export default function Moments() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;
  const { removeMoment } = useAdminProfile();
  const { currentUser } = useAuth();

  const [moments, setMoments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [markMomentAsViewed] = useMutation(MARK_MOMENT_AS_VIEWED);
  const [likeMoment] = useMutation(LIKE_MOMENT);
  const [unlikeMoment] = useMutation(UNLIKE_MOMENT);

  const { data, loading, error } = useQuery(GET_USER_MOMENTS, {
    variables: { userId },
    fetchPolicy: "network-only",
  });

  // Header Configuration
  useEffect(() => {
    const currentMoment = moments[currentIndex];
    if (currentMoment) {
      const date = new Date(
        parseInt(currentMoment.createdAt)
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const time = new Date(
        parseInt(currentMoment.createdAt)
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      navigation.setOptions({
        headerShown: true,
        headerTitle: () => (
          <View style={headerStyles.titleContainer}>
            <Text style={headerStyles.dateText}>{date}</Text>
            <Text style={headerStyles.timeText}>{time}</Text>
          </View>
        ),
        headerLeft: () => (
          <View style={headerStyles.headerLeft}>
            <ButtonIcon
              name="chevron.backward"
              weight="medium"
              onPress={() => navigation.goBack()}
              style={symbolStyles.backArrow}
            />
          </View>
        ),
        headerRight: () => (
          <View style={headerStyles.headerRight}>
            <ButtonIcon
              name={currentMoment.author._id === currentUser ? "trash" : "flag"}
              weight="medium"
              onPress={
                currentMoment.author._id === currentUser
                  ? handleDeleteMoment
                  : () =>
                      navigation.navigate("Report", {
                        entityId: currentMoment._id,
                        entityType: "MOMENT",
                      })
              }
              style={symbolStyles.trash}
              tintColor={"#E53935"}
            />
          </View>
        ),
      });
    }
  }, [navigation, moments, currentIndex]);

  // Handle Moments Data
  useEffect(() => {
    if (data?.getUserMoments) {
      const fetchedMoments = data.getUserMoments;
      setMoments(fetchedMoments);

      const firstUnviewedIndex = fetchedMoments.findIndex(
        (moment) =>
          !moment.views.some((view) => String(view._id) === String(userId))
      );

      setCurrentIndex(firstUnviewedIndex >= 0 ? firstUnviewedIndex : 0);
      resetTimer();
    }
  }, [data]);

  // Progress Timer
  const startTimer = useCallback(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: MOMENT_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) handleNextMoment();
    });
  }, [currentIndex]);

  useEffect(() => {
    startTimer();
    return () => progressAnim.stopAnimation(); // Stop timer when component unmounts or index changes
  }, [currentIndex, startTimer]);

  const resetTimer = () => {
    progressAnim.setValue(0);
    startTimer();
  };

  // Mark Moment as Viewed
  const markAsViewed = async (momentId) => {
    try {
      await markMomentAsViewed({ variables: { momentId } });
    } catch (err) {
      console.error("Error marking moment as viewed:", err);
    }
  };

  // Handle Like/Unlike
  const handleLikeMoment = async (momentId) => {
    try {
      setIsLiked(true); // Optimistic Update
      const response = await likeMoment({ variables: { momentId } });
      if (!response.data.likeMoment.success) {
        setIsLiked(false); // Revert if failed
      }
    } catch (error) {
      console.error("Error liking moment:", error.message);
      setIsLiked(false);
    }
  };

  const handleUnlikeMoment = async (momentId) => {
    try {
      setIsLiked(false); // Optimistic Update
      const response = await unlikeMoment({ variables: { momentId } });
      if (!response.data.unlikeMoment.success) {
        setIsLiked(true); // Revert if failed
      }
    } catch (error) {
      console.error("Error unliking moment:", error.message);
      setIsLiked(true);
    }
  };

  // Handle Moment Navigation
  const handleNextMoment = () => {
    if (currentIndex < moments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigation.goBack();
    }
  };

  const handlePrevMoment = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      resetTimer();
    }
  };

  // Handle Delete Moment
  const handleDeleteMoment = () => {
    setIsDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const updatedMoments = moments.filter(
        (_, index) => index !== currentIndex
      );
      await removeMoment(moments[currentIndex]._id);

      if (updatedMoments.length > 0) {
        setMoments(updatedMoments);
        setCurrentIndex(
          currentIndex < updatedMoments.length ? currentIndex : currentIndex - 1
        );
        resetTimer();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error deleting moment:", error);
    } finally {
      setIsDeleteAlertVisible(false);
    }
  };

  // Render Loading or Error State
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || moments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No moments to display.</Text>
      </View>
    );
  }

  const currentMoment = moments[currentIndex];
  const isAuthor = currentMoment.author._id === currentUser;

  return (
    <View style={[layoutStyles.wrapper, { paddingTop: 24 }]}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        {moments.map((_, i) => (
          <View key={i} style={styles.progressSegment}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        })
                      : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Touchable Area */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.touchableContainer}
        onPress={(e) => {
          const touchX = e.nativeEvent.locationX;
          touchX < width / 2 ? handlePrevMoment() : handleNextMoment();
        }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentMoment.cameraShot.image }}
            style={styles.image}
          />
        </View>
      </TouchableOpacity>

      {/* User Info */}
      <View style={styles.bottomContainer}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: currentMoment.author.profilePicture }}
            style={styles.profilePicture}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.fullName}>{currentMoment.author.fullName}</Text>
            <Text style={styles.username}>
              @{currentMoment.author.username}
            </Text>
          </View>
        </View>
        <Icon
          name={isLiked ? "heart.fill" : "heart"}
          tintColor={isLiked ? "#ff0000" : "#ffffff"}
          style={symbolStyles.like}
          weight="semibold"
          onPress={() => {
            if (!isAuthor) {
              isLiked
                ? handleUnlikeMoment(currentMoment._id)
                : handleLikeMoment(currentMoment._id);
            }
          }}
        />
      </View>

      {/* Delete Alert */}
      <DangerAlert
        visible={isDeleteAlertVisible}
        onRequestClose={() => setIsDeleteAlertVisible(false)}
        title="Delete Moment"
        message="Are you sure you want to delete this moment?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteAlertVisible(false)}
        cancelButtonText="Discard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  progressBarContainer: {
    flexDirection: "row",
    width: "97.5%",
    alignSelf: "center",
    height: 3,
    justifyContent: "space-between",
  },
  progressSegment: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: "#555",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  touchableContainer: {
    height: imageHeight,
    width: width,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2 / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "97.5%",
    height: "97.5%",
    resizeMode: "cover",
    borderRadius: 4,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    width: 44,
    height: 44,
    borderRadius: 4,
    marginRight: 12,
  },
  fullName: {
    color: "#fff",
    fontWeight: "bold",
  },
  username: {
    color: "#aaa",
    fontSize: 12,
  },
});
