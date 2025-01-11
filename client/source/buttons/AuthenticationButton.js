import { Pressable, Text } from "react-native";
import { buttonStyles } from "../styles/components/buttonStyles";

export default function AuthenticationButton({
  backgroundColor = "#1C1C1C",
  textColor = "#FFFFFF",
  borderColor,
  width = "100%",
  text,
  marginTop = 0,
  onPress,
}) {
  return (
    <Pressable
      style={[
        buttonStyles.authenticationButton,
        {
          backgroundColor,
          width,
          marginTop,
          borderColor: borderColor || backgroundColor,
          borderWidth: borderColor ? 1 : 0,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[buttonStyles.authenticationButtonText, { color: textColor }]}
      >
        {text}
      </Text>
    </Pressable>
  );
}
