import { Pressable, Text } from "react-native";
import { buttonStyles } from "../styles/components/buttonStyles";

export default function CollageButton({
  text,
  textColor,
  onPress,
  backgroundColor,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        buttonStyles.collageButton,
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
