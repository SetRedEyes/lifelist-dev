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
import { useAuth } from "../../../contexts/AuthContext";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_COLLAGE } from "../../../utils/mutations/collageCreationMutations";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import { headerStyles } from "../../../styles/components";
import { GET_USER_PROFILE } from "../../../utils/queries/userQueries";
import { useHeaderHeight } from "@react-navigation/elements";

export default function EditPreview() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { updateCollageInProfile } = useAdminProfile();
  const { collage, resetCollage } = useCreateCollageContext();
  const { currentUser } = useAuth();
  const { images, caption, taggedUsers, coverImage, _id: collageId } = collage;
  const headerHeight = useHeaderHeight();

  const screenHeight = Dimensions.get("window").height;

  // Calculate dynamic collage height
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
    onCompleted: () => {
      const returnTo = params?.returnTo || "MainFeed";
      console.log(returnTo);

      navigation.navigate(returnTo, {
        collageId: params?.collageId,
        index: params?.currentIndex || 0, // Pass currentIndex
      });
    },
    onError: (error) => {
      console.error(error.message);
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

      if (data?.updateCollage?.success) {
        // Package the updated collage information
        const updatedCollage = {
          _id: collageId,
          coverImage: coverImage, // The new cover image
        };

        // Update the context
        updateCollageInProfile(updatedCollage);

        // Reset the collage state and navigate back
        resetCollage();
        handleNavigateBack();
      } else {
        throw new Error(
          data?.updateCollage?.message || "Failed to update collage."
        );
      }
    } catch (error) {
      console.error("Error updating collage:", error.message);
      Alert.alert(
        "Error",
        "An error occurred while updating the collage. Please try again."
      );
    }
  };

  // Function to navigate back to the originating screen
  const handleNavigateBack = () => {
    const returnTo = params?.returnTo || "MainFeed";
    navigation.navigate(returnTo, { collageId });
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
      {/* Overlay to cover the bottom tab navigator */}
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
