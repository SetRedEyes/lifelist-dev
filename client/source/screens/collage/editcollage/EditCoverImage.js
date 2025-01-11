import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ButtonIcon from "../../../icons/ButtonIcon";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import {
  layoutStyles,
  symbolStyles,
  headerStyles,
} from "../../../styles/components/index";

export default function EditCoverImage() {
  const navigation = useNavigation();
  const { collage, updateCollage } = useCreateCollageContext();

  // Preload selected cover image from context
  const [selectedCoverImage, setSelectedCoverImage] = useState(
    collage.coverImage || collage.images[0]?.imageThumbnail
  );
  const [isModified, setIsModified] = useState(false);

  // Handle selecting a new cover image
  const handleSelectCoverImage = (image) => {
    setSelectedCoverImage(image);
    setIsModified(image !== collage.coverImage);
  };

  // Handle saving the new cover image
  const handleSave = () => {
    updateCollage({ coverImage: selectedCoverImage });
    navigation.goBack();
  };

  // Set navigation header options
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Edit Cover Image",
      headerTitleStyle: {
        color: "#fff",
      },
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="chevron.backward"
            weight="medium"
            onPress={() => navigation.goBack()}
            style={symbolStyles.backArrow}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <Pressable onPress={handleSave} disabled={!isModified}>
            <Text
              style={[
                headerStyles.saveButtonText,
                isModified && headerStyles.saveButtonTextActive,
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, isModified]);

  // Render a camera shot as a selectable cover image
  const renderShot = ({ item }) => (
    <CameraShotSelectCard
      shot={item}
      isSelected={selectedCoverImage === item.imageThumbnail}
      onCheckboxToggle={() => handleSelectCoverImage(item.imageThumbnail)}
    />
  );

  // Return the UI for editing the cover image
  return (
    <View style={layoutStyles.wrapper}>
      <FlatList
        data={collage.images}
        renderItem={renderShot}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flatListContent: {
    padding: 1.5,
  },
  saveButtonText: {
    color: "#696969",
    fontWeight: "600",
    fontSize: 16,
  },
  saveButtonTextActive: {
    color: "#6AB952",
  },
});
