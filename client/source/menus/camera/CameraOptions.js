import React from "react";
import { Pressable, Text, View } from "react-native";
import Icon from "../../icons/Icon";
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import BottomPopup from "../BottomPopup";

export default function CameraOptions({
  visible,
  onRequestClose,
  setCameraType,
}) {
  // Helper function to handle camera type selection
  const handleSelectCameraType = (type) => {
    setCameraType(type);
    onRequestClose(); // Close the popup after selection
  };

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={244} // Adjust height as needed
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>Camera Filters</Text>

        {/* Standard */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => handleSelectCameraType("Standard")}
        >
          <View style={menuStyles.flexRow}>
            <Icon name="plus.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>
              Standard
            </Text>
          </View>
          <Icon
            name="chevron.forward"
            style={symbolStyles.forwardArrow}
            weight="semibold"
          />
        </Pressable>

        {/* Disposable */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => handleSelectCameraType("Disposable")}
        >
          <View style={menuStyles.flexRow}>
            <Icon name="plus.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>
              Disposable
            </Text>
          </View>
          <Icon
            name="chevron.forward"
            style={symbolStyles.forwardArrow}
            weight="semibold"
          />
        </Pressable>

        {/* Fuji */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() => handleSelectCameraType("Fuji")}
        >
          <View style={menuStyles.flexRow}>
            <Icon name="plus.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>Fuji</Text>
          </View>
          <Icon
            name="chevron.forward"
            style={symbolStyles.forwardArrow}
            weight="semibold"
          />
        </Pressable>
      </View>
    </BottomPopup>
  );
}
