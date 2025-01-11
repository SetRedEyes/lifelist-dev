import { StyleSheet } from "react-native";

export const containerStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    color: "#696969",
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
  privateContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  privateText: {
    color: "#696969",
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
});
