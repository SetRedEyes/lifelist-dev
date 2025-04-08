import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const navigatorStyles = StyleSheet.create({
  // Base Navigator Styles
  navigatorWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    paddingBottom: 12,
  },
  navigatorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 32,
    justifyCprofileNavigatorWrapperontent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "transparent",
  },
  // NEW STYLE
  activeNavigatorButton: {
    backgroundColor: "#89C2FA30",
    borderWidth: 1,
    borderColor: "#89C2FA50",
  },
  navigatorText: {
    color: "#696969",
    fontWeight: "500",
  },
  activeNavigatorText: {
    color: "#89C2FA",
    fontWeight: "500",
  },

  // Screen Styles
  screenContainer: {
    flexDirection: "row",
    width: width * 2, // Default width for 2 tabs
    flex: 1,
  },
  screenCont: {
    flexDirection: "row",
    width: width, // Default width for 2 tabs
    flex: 1,
  },
  editProfileScreenContainer: {
    flexDirection: "row",
    width: width * 3,
    flex: 1,
  },
  screen: {
    width: width,
    flex: 1,
  },

  // Custom Styles for Specific Navigators
  exploreNavigatorWrapper: {
    flexDirection: "row",
    paddingBottom: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },
  profileNavigatorWrapper: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  editProfileNavigatorWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#121212",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  editProfileNavigatorButton: {
    width: "26%",
  },
  userRelationsNavigatorWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#121212",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  userRelationsNavigatorButton: {
    width: "40%",
  },
  listViewNavigatorWrapper: {
    marginVertical: 12,
  },
  momentsText: { color: "#5FC4ED" },
});
