import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ButtonIcon from "../../../icons/ButtonIcon";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import CameraShotSelectCard from "../../../cards/camera/CameraShotSelectCard";
import {
  layoutStyles,
  symbolStyles,
  headerStyles,
} from "../../../styles/components/index";

export default function ChangeCoverImage() {
  const navigation = useNavigation();
  const { collage, updateCollage } = useCreateCollageContext();
  const [selectedCoverImage, setSelectedCoverImage] = useState(
    collage.coverImage || collage.images[0]?.imageThumbnail
  );
  const [isModified, setIsModified] = useState(false);

  const handleSelectCoverImage = (image) => {
    setSelectedCoverImage(image);
    setIsModified(image !== collage.coverImage);
  };

  const handleSave = () => {
    updateCollage({ coverImage: selectedCoverImage });
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Change Cover Image",
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
  }, [navigation, isModified, handleSave]);

  const renderShot = ({ item }) => (
    <CameraShotSelectCard
      shot={item}
      isSelected={selectedCoverImage === item.imageThumbnail}
      onCheckboxToggle={() => handleSelectCoverImage(item.imageThumbnail)}
    />
  );

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
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
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
