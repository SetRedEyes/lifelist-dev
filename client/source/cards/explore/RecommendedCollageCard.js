import { useNavigation } from "@react-navigation/native";
import { Pressable, Dimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";

// Calculate dimensions for a 2:3 image ratio
const { width: screenWidth } = Dimensions.get("window");
const spacing = 2;
const collageWidth = (screenWidth - spacing * 4) / 3;
const collageHeight = (collageWidth * 3) / 2;

export default function RecommendedCollageCard({ collage, collages, index }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("CollageStack", {
      screen: "ViewCollage",
      params: {
        collages,
        initialIndex: index,
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image
        source={{ uri: collage.coverImage }}
        style={[
          styles.image,
          {
            width: collageWidth,
            height: collageHeight,
          },
        ]}
        contentFit="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: collageWidth,
    marginRight: spacing,
    marginBottom: spacing,
  },
  image: {
    backgroundColor: "#252525",
  },
});
