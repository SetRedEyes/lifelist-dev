import React from "react";
import ButtonIcon from "./ButtonIcon";
import { View } from "react-native";

export default function CollageButtonIcon({
  name,
  style,
  weight = "bold",
  tintColor = "#fff",
  onPress,
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <ButtonIcon
        name={name}
        style={style}
        weight={"medium"}
        tintColor={tintColor}
        onPress={onPress}
        backgroundColor={"rgba(38, 40, 40, 0.25)"}
        size="large"
      />
    </View>
  );
}
