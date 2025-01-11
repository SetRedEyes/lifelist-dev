import { Text, View, Pressable, Keyboard } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { cardStyles } from "../../styles/components/cardStyles";

export default function UserSearchCard({ user, cacheVisitedProfile }) {
  const profilePictureUrl = user.user.profilePicture;

  const navigation = useNavigation();

  const handleProfilePress = () => {
    // Dismiss the keyboard
    Keyboard.dismiss();

    cacheVisitedProfile(user);
    navigation.navigate("ProfileStack", {
      screen: "Profile",
      params: { userId: user.user._id },
    });
  };

  return (
    <Pressable
      style={cardStyles.listItemContainer}
      onPress={handleProfilePress}
    >
      <Pressable
        style={cardStyles.contentContainer}
        onPress={handleProfilePress}
      >
        <Image source={{ uri: profilePictureUrl }} style={cardStyles.imageMd} />
        <View style={cardStyles.textContainer}>
          <Text style={cardStyles.primaryText}>{user.user.fullName}</Text>
          <Text style={cardStyles.secondaryText}>@{user.user.username}</Text>
        </View>
      </Pressable>
    </Pressable>
  );
}
