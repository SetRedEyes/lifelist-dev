import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import Icon from "../../icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@apollo/client"; // Import Apollo mutations
import { useCollageLists } from "../../contexts/CollageListsContext"; // Import context
import { menuStyles } from "../../styles/components/menuStyles";
import { symbolStyles } from "../../styles/components/symbolStyles";
import BottomPopup from "../BottomPopup";
import { SAVE_COLLAGE, UNSAVE_COLLAGE } from "../../utils/mutations";

export default function DefaultCollageOptions({
  visible,
  onRequestClose,
  collageId,
  collage,
  isSaved: initialIsSaved, // Get initial saved state as a prop
}) {
  const navigation = useNavigation();
  const { addCollageToContext, removeCollageFromContext } = useCollageLists();

  // ✅ Track isSaved state locally
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  // Mutations
  const [saveCollage] = useMutation(SAVE_COLLAGE);
  const [unsaveCollage] = useMutation(UNSAVE_COLLAGE);

  // ✅ Save/Unsave functionality
  const handleSavePress = async () => {
    try {
      if (isSaved) {
        // Unsave logic
        const { data } = await unsaveCollage({ variables: { collageId } });
        if (data?.unsaveCollage?.success) {
          removeCollageFromContext("saved", collageId); // ✅ Remove from saved list
          setIsSaved(false); // ✅ Update local state
        }
      } else {
        // Save logic
        const { data } = await saveCollage({ variables: { collageId } });
        if (data?.saveCollage?.success) {
          addCollageToContext("saved", collage); // ✅ Add to saved list
          setIsSaved(true); // ✅ Update local state
        }
      }
    } catch (error) {
      console.error("Error saving/unsaving collage:", error.message);
    }
  };

  // Report Function
  const handleReportPress = () => {
    onRequestClose();
    navigation.navigate("Report", {
      entityId: collageId,
      entityType: "COLLAGE",
    });
  };

  // Share options (future implementation)
  const shareOptions = [
    { name: "Copy Link", icon: "link.circle", onPress: () => {} },
  ];

  return (
    <BottomPopup
      visible={visible}
      onRequestClose={onRequestClose}
      initialHeight={274}
    >
      <View style={menuStyles.popupContainer}>
        <Text style={menuStyles.header}>Options</Text>

        {/* ✅ Save/Unsave Collage */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleSavePress}
        >
          <View style={menuStyles.flexRow}>
            <Icon
              name={isSaved ? "bookmark.fill" : "bookmark"}
              style={symbolStyles.popupIcon}
              tintColor="#6AB952"
              weight="semibold"
            />
            <Text style={[menuStyles.spacer, menuStyles.greenText]}>
              {isSaved ? "Unsave" : "Save"}
            </Text>
          </View>
        </Pressable>

        {/* Report */}
        <Pressable
          style={[menuStyles.cardContainer, menuStyles.flex]}
          onPress={handleReportPress}
        >
          <View style={menuStyles.flexRow}>
            <Icon
              name="exclamationmark.bubble"
              style={symbolStyles.popupIcon}
              tintColor="#FF6347"
            />
            <Text style={[menuStyles.spacer, menuStyles.redText]}>Report</Text>
          </View>
        </Pressable>

        {/* Share Options */}
        <Text style={[menuStyles.header, menuStyles.shareHeader]}>Share</Text>
        {shareOptions.map((option, index) => (
          <Pressable
            key={index}
            style={[menuStyles.cardContainer, menuStyles.flex]}
            onPress={option.onPress}
          >
            <View style={menuStyles.flexRow}>
              <Icon name={option.icon} style={symbolStyles.popupIcon} />
              <Text style={[menuStyles.spacer, menuStyles.popupText]}>
                {option.name}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </BottomPopup>
  );
}
