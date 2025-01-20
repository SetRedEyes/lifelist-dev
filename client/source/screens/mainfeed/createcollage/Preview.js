import React, { useEffect } from "react";
import { Text, Pressable, View, StyleSheet, Dimensions } from "react-native";
import CollagePreviewDisplay from "../../../displays/CollagePreviewDisplay";
import { useNavigation } from "@react-navigation/native";
import { useCreateCollageContext } from "../../../contexts/CreateCollageContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useAdminProfile } from "../../../contexts/AdminProfileContext";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_COLLAGE } from "../../../utils/mutations/collageCreationMutations";
import ButtonIcon from "../../../icons/ButtonIcon";
import { symbolStyles } from "../../../styles/components/symbolStyles";
import { headerStyles } from "../../../styles/components";
import { GET_USER_PROFILE } from "../../../utils/queries/userQueries";
import { useHeaderHeight } from "@react-navigation/elements";

const screenHeight = Dimensions.get("window").height;

export default function CollagePreview() {
  const navigation = useNavigation();
  const { collage, resetCollage } = useCreateCollageContext();
  const { currentUser } = useAuth();
  const { addCollage } = useAdminProfile();
  const { images, caption, taggedUsers, coverImage } = collage;
  const headerHeight = useHeaderHeight();

  console.log(coverImage);

  // Calculate dynamic collage height
  const collageHeight = screenHeight - headerHeight - 83;

  // Fetch user profile data
  const { data: userData } = useQuery(GET_USER_PROFILE, {
    variables: { userId: currentUser },
    skip: !currentUser,
  });

  // Mutation to create the collage
  const [createCollage] = useMutation(CREATE_COLLAGE, {
    onCompleted: () => navigation.navigate("MainFeed", { refresh: true }),
    onError: (error) => console.error(error.message),
  });

  // Handle Post Collage
  const handlePostCollage = async () => {
    if (!images || images.length === 0) {
      alert("Please select at least one image to create a collage.");
      return;
    }

    try {
      const imagePaths = images.map((item) => item.image);
      const taggedUserIds = taggedUsers.map((user) => user._id);

      const { data } = await createCollage({
        variables: {
          caption: caption || "",
          images: imagePaths,
          taggedUsers: taggedUserIds,
          coverImage,
        },
      });

      if (data?.createCollage?.success) {
        const newCollage = data.createCollage.collage;
        await addCollage(newCollage);
        resetCollage();
        navigation.navigate("MainFeed", { refresh: true });
      } else {
        throw new Error(
          data?.createCollage?.message || "Failed to create collage."
        );
      }
    } catch (error) {
      console.error("Error creating collage:", error.message);
      alert("An error occurred while creating the collage. Please try again.");
    }
  };

  // Configure header dynamically
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Preview",
      headerTitleStyle: { color: "#fff" },
      headerStyle: { backgroundColor: "#121212" },
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
            onPress={handlePostCollage}
            style={headerStyles.saveButtonText}
          >
            <Text style={headerStyles.saveButtonTextActive}>Post</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, collage, handlePostCollage]);

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
