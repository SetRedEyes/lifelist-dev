import React from "react";
import { Text, Pressable, View } from "react-native";
import Checkbox from "expo-checkbox"; // Ensure you have this package installed
import { cardStyles } from "../../styles/components/cardStyles";

export default function ReportCard({ label, selected, onSelect }) {
  return (
    <Pressable style={cardStyles.reportContainer} onPress={onSelect}>
      <View style={cardStyles.contentContainer}>
        <Text style={cardStyles.primaryText}>{label}</Text>
        <Checkbox
          value={selected}
          onValueChange={onSelect}
          style={cardStyles.checkbox}
          color={selected ? "#6AB952" : "#696969"}
        />
      </View>
    </Pressable>
  );
}
