import { StyleSheet } from "react-native";
import { SPACING } from "../globals";

export const layoutStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentContainer: {
    flex: 1,
    marginTop: SPACING.medium,
    marginHorizontal: SPACING.medium,
  },
});
