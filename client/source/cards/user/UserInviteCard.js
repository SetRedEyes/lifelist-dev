import React from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import * as SMS from "expo-sms";
import SmallGreyButton from "../../buttons/SmallGreyButton";
import { cardStyles } from "../../styles/components/cardStyles";

export default function UserInviteCard({ contact }) {
  const handleInvitePress = async () => {
    try {
      const phoneNumber = contact.phoneNumbers?.[0]?.number;
      if (!phoneNumber) {
        Alert.alert("Error", "No phone number available for this contact.");
        return;
      }

      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync(
          [phoneNumber],
          "Hey! Join me on LifeList. Here's the link: https://lifelist.app/invite"
        );
        console.log("SMS result:", result);
      } else {
        Alert.alert("Error", "SMS is not available on this device.");
      }
    } catch (error) {
      console.error("Failed to send SMS:", error);
      Alert.alert("Error", "Failed to send the invite. Please try again.");
    }
  };

  return (
    <Pressable onPress={handleInvitePress} style={cardStyles.listItemContainer}>
      <View style={cardStyles.contentContainer}>
        {contact.imageAvailable ? (
          <Image
            source={{ uri: contact.image.uri }}
            style={cardStyles.imageMd}
          />
        ) : (
          <View style={cardStyles.placeholder} />
        )}
        <View style={cardStyles.textContainer}>
          <Text style={cardStyles.primaryText}>{contact.name}</Text>
          <Text style={cardStyles.secondaryText}>
            {contact.phoneNumbers?.[0]?.number || "No phone number"}
          </Text>
        </View>
        <View style={cardStyles.actionButtonSpacer}>
          <SmallGreyButton
            text="Invite"
            textColor={"#6AB952"}
            onPress={handleInvitePress}
            backgroundColor={"#252525"}
          />
        </View>
      </View>
    </Pressable>
  );
}
