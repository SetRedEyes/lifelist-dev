import React, { useEffect } from "react";
import {
  Text,
  Pressable,
  View,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import CollagePreviewDisplay from "../../../displays/CollagePreviewDisplay";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_COLLAGE } from "../../../utils/mutations/collageCreationMutations";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import { headerStyles } from "../../../styles/components";
import { GET_USER_PROFILE } from "../../../utils/queries/userQueries";
import { useHeaderHeight } from "@react-navigation/elements";
import { useAuth } from "../../../contexts/AuthContext";

export default function EditPreview() {
  const navigation = useNavigation();
  const { updateCollageInProfile } = useAdminProfile();
  const { collage, resetCollage, collages, currentIndex } =
    useCreateCollageContext();
  const { images, caption, taggedUsers, coverImage, _id: collageId } = collage;
  const { currentUser } = useAuth();

  // Calculate dynamic collage height
  const screenHeight = Dimensions.get("window").height;
  const headerHeight = useHeaderHeight();
  const collageHeight = screenHeight - headerHeight - 83;

  // Fetch user profile data
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_PROFILE, {
    variables: { userId: currentUser },
    skip: !currentUser,
  });

  // Mutation to update the collage
  const [updateCollage] = useMutation(UPDATE_COLLAGE, {
    onCompleted: (data) => {
      if (data?.updateCollage?.success) {
        updateCollageInProfile({
          _id: collageId,
          coverImage,
        });
        resetCollage();

        // Navigate back to MainFeed with the correct index
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "MainFeed",
              params: { initialIndex: currentIndex, collages },
            },
          ],
        });
      } else {
        Alert.alert("Error", "Failed to update the collage.");
      }
    },
    onError: (error) => {
      console.error(error.message);
      Alert.alert("Error", "An error occurred while updating the collage.");
    },
  });

  const taggedUserIds = taggedUsers.map((user) => user._id);
  const imagePaths = images.map((item) => item.image);

  // Function to handle updating the collage
  const handleUpdateCollage = async () => {
    if (!images || images.length === 0) {
      Alert.alert(
        "Error",
        "Please select at least one image to update the collage."
      );
      return;
    }

    try {
      const { data } = await updateCollage({
        variables: {
          collageId,
          caption: caption || "",
          images: imagePaths,
          taggedUsers: taggedUserIds,
          coverImage,
        },
      });
    } catch (error) {
      console.error("Error updating collage:", error.message);
      Alert.alert(
        "Error",
        "An error occurred while updating the collage. Please try again."
      );
    }
  };

  // Configure header dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Edit Preview",
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
          <Pressable
            onPress={handleUpdateCollage}
            style={headerStyles.saveButtonText}
          >
            <Text style={headerStyles.saveButtonTextActive}>Save</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, collage, handleUpdateCollage]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: collageHeight }}>
        <CollagePreviewDisplay
          disabled={true}
          userProfile={userData?.getUserProfileById}
        />
      </View>
      <Pressable
        style={styles.overlay}
        onPress={() => alert("Tab navigation is disabled in this screen.")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 83, // Adjust the height as per your tab bar height
    backgroundColor: "#1c1c1c",
    zIndex: 1000,
  },
});
