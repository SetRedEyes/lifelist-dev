import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { headerStyles } from "../../../styles/components/headerStyles";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import { useNavigation } from "@react-navigation/native";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import ButtonIcon from "../../../icons/ButtonIcon";
import AuthenticationButton from "../../../buttons/AuthenticationButton";
import { formStyles } from "../../../styles/components/formStyles";

export default function Overview() {
  const navigation = useNavigation();
  const { collage, updateCollage } = useCreateCollageContext();

  const { caption, coverImage, images } = collage;
  const currentCoverImage = coverImage || images[0]?.imageThumbnail || null;
  const [captionText, setCaptionText] = useState(caption || "");
  const maxCharacters = 125;

  console.log(currentCoverImage);

  const handleCaptionChange = (text) => {
    if (text.length <= maxCharacters) {
      setCaptionText(text);
      updateCollage({ caption: text });
    }
  };

  const handleNextPage = () => {
    navigation.navigate("Preview");
  };

  const handleAddParticipants = () => {
    navigation.navigate("TagUsers");
  };

  const handleChangeCoverImage = () => {
    navigation.navigate("ChangeCoverImage");
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Overview",
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
          <ButtonIcon
            name="chevron.forward"
            weight="medium"
            onPress={handleNextPage}
            style={symbolStyles.backArrow}
            tintColor="#6AB952"
          />
        </View>
      ),
    });
  }, [navigation]);

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: "#121212", paddingHorizontal: 16 }}
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      {/* Form Section */}
      <View style={[formStyles.formContainer, { marginTop: 32 }]}>
        {/* Change Cover Image */}
        <Pressable
          style={[formStyles.inputWrapper, { alignSelf: "center" }]}
          onPress={handleChangeCoverImage}
        >
          {currentCoverImage ? (
            <Image source={{ uri: currentCoverImage }} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>No Cover Image Selected</Text>
          )}
          <Text style={{ color: "#fff", marginTop: 8, fontWeight: "600" }}>
            Change Cover Image
          </Text>
        </Pressable>

        {/* Caption Input */}
        <View style={formStyles.inputWrapper}>
          <View style={styles.labelRow}>
            <Text style={formStyles.label}>Caption</Text>
            <Text style={styles.charCount}>
              {maxCharacters - captionText.length}
            </Text>
          </View>
          <TextInput
            style={formStyles.input}
            onChangeText={handleCaptionChange}
            value={captionText}
            placeholder="Enter your caption"
            placeholderTextColor="#d4d4d4"
            maxLength={maxCharacters}
          />
        </View>

        {/* Bottom Buttons */}
        <AuthenticationButton
          text="Tag Users"
          backgroundColor="#252525"
          textColor="#fff"
          width="100%"
          marginTop={12}
          onPress={handleAddParticipants}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 175,
    width: 120,
    borderRadius: 4,
    alignSelf: "center",
  },
  placeholderText: {
    height: 175,
    width: 120,
    textAlign: "center",
    color: "#d4d4d4",
    alignSelf: "center",
    fontWeight: "600",
    paddingTop: 60,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: {
    color: "#696969",
    fontSize: 12,
    marginRight: 8,
  },
});
