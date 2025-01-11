import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const aspectRatio = 3 / 2;

export const displayStyles = StyleSheet.create({
  // Progress Bar Styles
  progressBarContainer: {
    flexDirection: "row",
    width: "97.5%",
    alignSelf: "center",
    height: 3,
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressSegment: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: "#555",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  activeProgressFill: {
    backgroundColor: "#6AB952", // Highlight current progress bar
  },

  // Touchable Styles
  touchableContainer: {
    height: Dimensions.get("window").width * (3 / 2), // Aspect ratio 3:2
    width: "100%",
  },

  // Image Styles
  imageContainer: {
    width: width, // Full screen width
    height: width * aspectRatio, // Dynamic height based on aspect ratio
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "97.5%",
    height: "97.5%",
    resizeMode: "cover",
    borderRadius: 4,
  },
  developingImage: {
    width: "87.5%",
    height: "87.5%",
    resizeMode: "cover",
    borderRadius: 4,
  },
  imageContainer: {
    position: "relative",
    width: width,
    height: width * (3 / 2), // Maintain 2:3 aspect ratio for images
    justifyContent: "center",
    alignItems: "center",
  },
  collageImage: {
    width: "100%",
    height: "100%",
  },
  topContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    height: 35,
    width: 35,
    borderRadius: 4,
    borderColor: "rgba(38, 40, 40, 0.3)",
    borderWidth: 2,
    marginRight: 6,
  },
  fullName: {
    fontWeight: "600",
    color: "#fff",
  },
  location: {
    fontSize: 12,
    color: "#fff",
  },
  actionContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "column", // Align action icons vertically
    alignItems: "center",
  },
  iconSpacer: {
    marginTop: 12, // Adds spacing between action icons
  },
  bottomContainer: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 12,
    justifyContent: "space-between",
  },
  captionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  captionTextContainer: {
    flex: 1,
  },
  caption: {
    flexWrap: "wrap",
    alignItems: "flex-start",
    color: "#fff",
  },
  username: {
    fontWeight: "600",
    color: "#fff",
  },
  dateButton: {
    backgroundColor: "#252525",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  commentsButton: {
    backgroundColor: "#252525",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  participantsButton: {
    backgroundColor: "#252525",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  participantsButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});
