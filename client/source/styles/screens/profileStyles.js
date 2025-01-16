import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  overviewContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightContainer: {
    flex: 1,
    marginLeft: 20,
    marginRight: 8,
  },
  profilePicture: {
    height: 100,
    width: 100,
    borderRadius: 6,
  },
  followerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    marginHorizontal: 8,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 12,
    color: "#ffffff",
  },
  username: {
    fontWeight: "700",
    fontSize: 16,
    color: "#ffffff",
    marginTop: 8,
  },
  bio: {
    color: "#ffffff",
    marginTop: 4,
  },

  // Edit Profile Bottom Container
  bottomContainer: {
    backgroundColor: "#1C1C1C",
    borderTopColor: "#252525",
    borderTopWidth: 1,
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 48,
    zIndex: 1,
    height: 164,
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 48,
  },
  spacer: {
    marginBottom: 8,
  },
});
