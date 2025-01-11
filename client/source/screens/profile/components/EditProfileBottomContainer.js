import React from "react";
import { View } from "react-native";
import AuthenticationButton from "../../../buttons/AuthenticationButton";
import { profileStyles } from "../../../styles/screens/profileStyles";

export default function EditProfileBottomContainer({
  saveChanges,
  discardChanges,
}) {
  return (
    <View style={profileStyles.bottomContainer}>
      <View style={profileStyles.spacer}>
        <AuthenticationButton
          text="Save Changes"
          backgroundColor={"#6AB95230"}
          borderColor={"#6AB95250"}
          textColor={"#6AB952"}
          onPress={saveChanges}
        />
      </View>
      <AuthenticationButton
        text="Discard"
        backgroundColor={"#1C1C1C"}
        borderColor={"#1C1C1C"}
        textColor={"#d4d4d4"}
        onPress={discardChanges}
      />
    </View>
  );
}
