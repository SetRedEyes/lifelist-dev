import { StyleSheet } from "react-native";

export const editProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#fff",
  },
  profilePictureContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profilePicture: {
    height: 50,
    width: 50,
    borderRadius: 4,
  },
  changeProfilePictureText: {
    paddingLeft: 12,
    color: "#fff",
    fontWeight: "600",
  },
});
