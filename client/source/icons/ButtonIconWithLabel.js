import React from "react";
import { Pressable, Text } from "react-native";
import ButtonIcon from "./ButtonIcon";
import { iconStyles } from "../styles/components/iconStyles";

export default function ButtonIconWithLabel({
  iconName,
  label,
  onPress,
  disabled = false,
  size = "extralarge", // default or large
  style,
}) {
  return (
    <Pressable
      style={[
        iconStyles.iconButtonWithPadding,
        disabled && iconStyles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ButtonIcon name={iconName} size={size} onPress={onPress} style={style} />
      <Text style={iconStyles.labelText}>{label}</Text>
    </Pressable>
  );
}
