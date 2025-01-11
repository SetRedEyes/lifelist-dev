import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { mainFeedStyles } from "../../../styles/screens/mainFeedStyles";
import Icon from "../../../icons/Icon";

export default function MediaPlaceholder() {
  return (
    <View style={mainFeedStyles.placeholderContainer}>
      <Icon
        name="photo.fill"
        style={mainFeedStyles.placeholderIcon}
        tintColor={"#696969"}
      />
      <Text style={mainFeedStyles.placeholderText}>
        Please select at least 1 image
      </Text>
    </View>
  );
}
