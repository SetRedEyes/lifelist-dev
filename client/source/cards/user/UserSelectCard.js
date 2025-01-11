import React, { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import Checkbox from "expo-checkbox";
import { cardStyles } from "../../styles/components/cardStyles";

export default function UserSelectCard({ user, isSelected, onSelect }) {
  const profilePictureUrl = user.profilePicture;

  const handlePress = () => {
    onSelect(user);
  };

  return (
    <View style={cardStyles.listItemContainer}>
      <Pressable style={cardStyles.contentContainer} onPress={handlePress}>
        <Image source={{ uri: profilePictureUrl }} style={cardStyles.imageMd} />
        <View style={cardStyles.textContainer}>
          <Text style={cardStyles.primaryText}>{user.fullName}</Text>
          <Text style={cardStyles.secondaryText}>@{user.username}</Text>
        </View>
        <Checkbox
          value={isSelected}
          onValueChange={handlePress}
          style={cardStyles.checkbox}
          color={isSelected ? "#6AB952" : "#d4d4d4"}
        />
      </Pressable>
    </View>
  );
}
