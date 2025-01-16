import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import DangerAlert from "../../alerts/DangerAlert";
import SmallGreyButton from "../../buttons/SmallGreyButton";
import { cardStyles } from "../../styles/components/cardStyles";
import { useNavigation } from "@react-navigation/native";

export default function UserBlockedCard({
  userId,
  fullName,
  username,
  profilePicture,
  onUnblock,
}) {
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);

  const handleProfilePress = () => navigation.push("Profile", { userId });

  const toggleAlert = () => setAlertVisible(!alertVisible);

  return (
    <View style={cardStyles.listItemContainer}>
      <View style={cardStyles.contentContainer}>
        <Pressable onPress={handleProfilePress}>
          <Image source={{ uri: profilePicture }} style={cardStyles.imageMd} />
        </Pressable>
        <Pressable
          style={cardStyles.textContainer}
          onPress={handleProfilePress}
        >
          <Text style={cardStyles.primaryText}>{fullName}</Text>
          <Text style={cardStyles.secondaryText}>@{username}</Text>
        </Pressable>
        <View style={cardStyles.actionButtonSpacer}>
          <SmallGreyButton
            text={"Blocked"}
            onPress={toggleAlert}
            backgroundColor={"#252525"}
          />
        </View>
      </View>
      <DangerAlert
        visible={alertVisible}
        onRequestClose={toggleAlert}
        title="Unblock User"
        message={`Are you sure you want to unblock this user?`}
        onConfirm={() => {
          onUnblock(userId); // Perform unblock action
          toggleAlert(); // Close the alert
        }}
        confirmButtonText="Unblock"
      />
    </View>
  );
}
