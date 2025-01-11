import { StyleSheet } from "react-native";

export const notificationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  searchBarContainer: {
    alignSelf: "center",
    marginTop: 12,
    width: "92.5%",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    borderRadius: 8,
  },
  friendRequestCard: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 16,
    paddingTop: 24,
  },
  friendRequestText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  flatListContent: {
    paddingHorizontal: 8,
  },
});
