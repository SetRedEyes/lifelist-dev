import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import SmallGreyButton from "../../buttons/SmallGreyButton";
import { cardStyles } from "../../styles/components/cardStyles";

export default function UserRelationCard({
  user,
  initialAction,
  onActionPress,
  isPrivate,
}) {
  const { currentUser } = useAuth();
  const [action, setAction] = useState(initialAction);
  const navigation = useNavigation();

  const handleProfilePress = () =>
    navigation.push("Profile", { userId: user._id });

  const handleActionPress = async () => {
    const newAction = await onActionPress(user._id, action, isPrivate);
    setAction(newAction);
  };

  // Determine the text color based on the action
  const getTextColor = () => {
    if (action === "Following") return "#6AB952"; // Green for Following
    return "#FFFFFF"; // Default white
  };

  return (
    <View style={cardStyles.listItemContainer}>
      <View style={cardStyles.contentContainer}>
        <Image
          source={{ uri: user.profilePicture }}
          style={cardStyles.imageMd}
        />
        <Pressable
          style={cardStyles.textContainer}
          onPress={handleProfilePress}
        >
          <Text style={cardStyles.primaryText}>{user.fullName}</Text>
          <Text style={cardStyles.secondaryText}>@{user.username}</Text>
        </Pressable>
        {currentUser !== user._id && (
          <View style={cardStyles.actionButtonSpacer}>
            <SmallGreyButton
              text={action}
              textColor={getTextColor()} // Pass the determined text color
              onPress={handleActionPress}
              backgroundColor={"#252525"}
            />
          </View>
        )}
      </View>
    </View>
  );
}
