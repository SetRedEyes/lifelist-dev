import React from "react";
import { Pressable, Text } from "react-native";
import { buttonStyles } from "../styles/components/buttonStyles";

export default function ProfileActionButton({
  onPress,
  text,
  backgroundColor = "#222",
  textColor = "#fff",
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[buttonStyles.profileActionButton, { backgroundColor }]}
    >
      <Text
        style={[buttonStyles.profileActionButtonText, { color: textColor }]}
      >
        {text}
      </Text>
    </Pressable>
  );
}
