import React, { useEffect } from "react";
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

  const handleCaptionChange = (text) => {
    updateCollage({ caption: text });
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
          <Text style={formStyles.label}>Caption</Text>
          <TextInput
            style={formStyles.input}
            onChangeText={handleCaptionChange}
            value={caption}
            placeholder="Enter your caption"
            placeholderTextColor="#d4d4d4"
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
  bottomButtonContainer: {
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    width: "94%",
    marginBottom: 16,
    alignSelf: "center",
  },
  label: {
    color: "#fff",
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "left",
  },
  input: {
    backgroundColor: "#252525",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    width: "100%",
  },
});
