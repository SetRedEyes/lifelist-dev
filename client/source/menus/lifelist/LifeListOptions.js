import React from "react";
import { Pressable, Text, View } from "react-native";
import Icon from "../../icons/Icon";
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import BottomPopup from "../BottomPopup";

export default function LifeListOptions({
  visible,
  onRequestClose,
  navigation,
}) {
  const handleNavigate = (screen, params) => {
    navigation.navigate(screen, params);
    onRequestClose();
  };

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={184} // Adjust height as needed
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>LifeList Actions</Text>

        {/* Add Experiences */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() =>
            handleNavigate("AddExperiencesSearch", {
              fromScreen: "AddExperiences",
            })
          }
        >
          <View style={menuStyles.flexRow}>
            <Icon name="plus.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>
              Add Experiences
            </Text>
          </View>
          <Icon
            name="chevron.forward"
            style={symbolStyles.forwardArrow}
            weight="semibold"
          />
        </Pressable>

        {/* Edit Experiences */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={() =>
            handleNavigate("ListView", {
              editMode: true,
              fromScreen: "EditExperiences",
            })
          }
        >
          <View style={menuStyles.flexRow}>
            <Icon name="plus.circle" style={symbolStyles.popupIcon} />
            <Text style={[menuStyles.spacer, menuStyles.popupText]}>
              Edit Experiences
            </Text>
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
