import { useNavigation } from "@react-navigation/native";
import { Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { truncateText } from "../../utils/commonHelpers";
import { cardStyles } from "../../styles/components/cardStyles";

export default function RecommendedCollageCard({
  collage,
  collages,
  index,
  collageWidth,
  collageHeight,
}) {
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
    <Pressable onPress={handlePress} style={{ width: collageWidth }}>
      <View>
        <Image
          source={{ uri: collage.coverImage }}
          style={[
            cardStyles.imageRadius,
            {
              height: collageHeight,
              width: collageWidth,
              backgroundColor: "#252525",
            },
          ]}
        />
        <View style={[cardStyles.textSpacer, { marginTop: 6 }]}>
          <Text style={cardStyles.primaryText}>
            {truncateText(collage.author.fullName, 20)}
          </Text>
          <Text style={cardStyles.secondaryText}>
            @{truncateText(collage.author.username, 20)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
