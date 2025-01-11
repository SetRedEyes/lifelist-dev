import { Pressable, Text } from "react-native";
import { buttonStyles } from "../styles/components/buttonStyles";

export default function SmallGreyButton({
  text,
  textColor,
  onPress,
  backgroundColor,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        buttonStyles.smallGreyButton,
        backgroundColor && { backgroundColor: backgroundColor },
      ]}
    >
      <Text
        style={[
          buttonStyles.smallButtonText,
          textColor ? { color: textColor } : "#fff",
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}
