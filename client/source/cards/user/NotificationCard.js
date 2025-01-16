import React from "react";
import { Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Swipeable } from "react-native-gesture-handler";
import { formatDate, truncateText } from "../../utils/commonHelpers";
import { cardStyles } from "../../styles/components/cardStyles";
import Icon from "../../icons/Icon";
import { symbolStyles } from "../../styles/components/symbolStyles";
import { useNavigation } from "@react-navigation/native";

export default function NotificationCard({
  notificationId,
  senderId,
  senderName,
  senderProfilePicture,
  message,
  createdAt,
  onDelete,
}) {
  const navigation = useNavigation();
  const truncatedMessage = truncateText(message, 32);

  const handleProfilePress = () =>
    navigation.push("Profile", { userId: senderId });

  const renderRightActions = () => (
    <Pressable
      style={cardStyles.deleteButton}
      onPress={() => onDelete(notificationId)}
    >
      <Icon name="trash" style={symbolStyles.trash} tintColor="#FF3B30" />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={cardStyles.listItemContainer}>
        <Pressable onPress={handleProfilePress}>
          <Image
            source={{ uri: senderProfilePicture }}
            style={cardStyles.imageMd}
          />
        </Pressable>
        <Pressable
          style={cardStyles.textContainer}
          onPress={handleProfilePress}
        >
          <Text style={cardStyles.primaryText}>{senderName}</Text>
          <Text style={cardStyles.secondaryText}>{truncatedMessage}</Text>
        </Pressable>
        <Text style={cardStyles.date}>{formatDate(createdAt)}</Text>
      </View>
    </Swipeable>
  );
}
