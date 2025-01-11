import React, { useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Swipeable } from "react-native-gesture-handler";
import { useMutation } from "@apollo/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../../icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { cardStyles } from "../../styles/components/cardStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import DangerAlert from "../../alerts/DangerAlert"; // Ensure this is the correct path

import {
  LIKE_COMMENT,
  UNLIKE_COMMENT,
} from "../../utils/mutations/collageActionMutations";

export default function CommentCard({
  comment,
  onDelete,
  onUpdate,
  onRequestClose,
  collageAuthorId,
}) {
  const navigation = useNavigation();
  const { currentUser } = useAuth();

  const [isLiked, setIsLiked] = useState(
    comment.likedBy.some((user) => user._id === currentUser._id)
  );
  const [likeCount, setLikeCount] = useState(comment.likes);

  const [alertVisible, setAlertVisible] = useState(false);

  const [likeComment] = useMutation(LIKE_COMMENT, {
    onCompleted: (data) => {
      setIsLiked(true);
      setLikeCount((prevCount) => prevCount + 1);
      onUpdate(data.likeComment);
    },
  });

  const [unlikeComment] = useMutation(UNLIKE_COMMENT, {
    onCompleted: (data) => {
      setIsLiked(false);
      setLikeCount((prevCount) => prevCount - 1);
      onUpdate(data.unlikeComment);
    },
  });

  const handleLikePress = () => {
    if (isLiked) {
      unlikeComment({ variables: { commentId: comment._id } });
    } else {
      likeComment({ variables: { commentId: comment._id } });
    }
  };

  const handleReportPress = () => {
    onRequestClose?.();
    navigation.navigate("Report", {
      entityId: comment._id,
      entityType: "COMMENT",
    });
  };

  const toggleAlert = () => setAlertVisible(!alertVisible);

  const handleDelete = () => {
    onDelete(comment._id);
    toggleAlert(); // Close the alert
  };

  const renderRightActions = () => {
    if (currentUser === comment.author._id) {
      return (
        <Pressable style={cardStyles.deleteAction} onPress={toggleAlert}>
          <Icon name="trash" style={symbolStyles.trash} tintColor="#fff" />
        </Pressable>
      );
    } else if (currentUser._id === collageAuthorId) {
      return (
        <View style={cardStyles.actionsContainer}>
          <Pressable style={cardStyles.deleteAction} onPress={toggleAlert}>
            <Icon name="trash" style={symbolStyles.trash} tintColor="#fff" />
          </Pressable>
          <Pressable
            style={cardStyles.reportAction}
            onPress={handleReportPress}
          >
            <Icon name="flag" style={symbolStyles.flag} tintColor="#FF3B30" />
          </Pressable>
        </View>
      );
    } else {
      return (
        <Pressable style={cardStyles.reportAction} onPress={handleReportPress}>
          <Icon name="flag" style={symbolStyles.flag} tintColor="#fff" />
        </Pressable>
      );
    }
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={cardStyles.commentCardContainer}>
        <Image
          source={{ uri: comment.author.profilePicture }}
          style={cardStyles.commentImage}
        />
        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={cardStyles.primaryText}>
              {comment.author.fullName}
            </Text>
            <Text style={styles.createdAtText}>
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </Text>
          </View>
          <Text style={cardStyles.commentText}>{comment.text}</Text>
        </View>

        {/* Like Section */}
        <View style={styles.likeSection}>
          <Pressable onPress={handleLikePress}>
            <Icon
              name={isLiked ? "heart.fill" : "heart"}
              style={symbolStyles.like}
              tintColor={isLiked ? "#FF0000" : "#696969"}
            />
          </Pressable>
          <Text style={cardStyles.likeCount}>{likeCount}</Text>
        </View>
      </View>

      {/* Danger Alert */}
      <DangerAlert
        visible={alertVisible}
        onRequestClose={toggleAlert}
        title="Delete Comment"
        message={`Are you sure you want to delete this comment? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmButtonText="Delete"
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  createdAtText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#696969",
  },
  likeSection: {
    alignItems: "center",
    justifyContent: "center",
  },
});
