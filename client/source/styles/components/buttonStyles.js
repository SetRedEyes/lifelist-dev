import { StyleSheet } from "react-native";

// === Small Grey Button === //

export const buttonStyles = StyleSheet.create({
  smallGreyButton: {
    borderRadius: 32,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#1C1C1C", // Grey color for button
  },
  collageButton: {
    borderRadius: 32,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#1C1C1C", // Grey color for button
  },
  smallButtonText: {
    fontWeight: "600",
    fontSize: 12,
    color: "#FFFFFF", // Default white text color
  },
  profileActionButton: {
    height: 35,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  profileActionButtonText: {
    fontWeight: "600",
  },
  // === Authentication Button === //
  authenticationButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  authenticationButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  iconContainer: {
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});
