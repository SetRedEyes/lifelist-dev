import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useMutation } from "@apollo/client";
import {
  ACCEPT_FOLLOW_REQUEST,
  DENY_FOLLOW_REQUEST,
} from "../../utils/mutations/index";
import SmallGreyButton from "../../buttons/SmallGreyButton";
import { cardStyles } from "../../styles/components/cardStyles";
import { useAdminProfile } from "../../contexts/AdminProfileContext";

export default function UserRequestCard({
  userId,
  fullName,
  username,
  profilePicture,
  onRemoveRequest,
}) {
  const [acceptFollowRequest] = useMutation(ACCEPT_FOLLOW_REQUEST);
  const [denyFollowRequest] = useMutation(DENY_FOLLOW_REQUEST);

  const { incrementFollowers } = useAdminProfile();

  const handleAccept = async () => {
    try {
      const { data } = await acceptFollowRequest({
        variables: { userIdToAccept: userId },
      });
      if (data?.acceptFollowRequest?.success) {
        incrementFollowers(); // Increment followers count in context
        onRemoveRequest(userId); // Remove the request from the UI
      }
    } catch (error) {
      console.error("Error accepting follow request:", error);
    }
  };

  const handleDecline = async () => {
    try {
      const { data } = await denyFollowRequest({
        variables: { userIdToDeny: userId },
      });
      if (data?.denyFollowRequest?.success) {
        onRemoveRequest(userId); // Remove the request from the UI
      }
    } catch (error) {
      console.error("Error declining follow request:", error);
    }
  };

  return (
    <View style={cardStyles.listItemContainer}>
      <View style={cardStyles.contentContainer}>
        <Image source={{ uri: profilePicture }} style={cardStyles.imageMd} />
        <Pressable style={cardStyles.textContainer}>
          <Text style={cardStyles.primaryText}>{fullName}</Text>
          <Text style={cardStyles.secondaryText}>@{username}</Text>
        </Pressable>
        <View style={cardStyles.actionButtonSpacer}>
          <SmallGreyButton
            text="Accept"
            onPress={handleAccept}
            backgroundColor="#6AB952"
          />
          <SmallGreyButton
            text="Decline"
            onPress={handleDecline}
            backgroundColor="#E53935"
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>
    </View>
  );
}
