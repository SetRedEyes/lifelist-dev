import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.405;
const imageHeight = cardWidth * (3 / 2);
const cardHeight = imageHeight + 44;

export const lifelistStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingLeft: 8,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  sectionSpacer: {
    marginTop: 8,
  },
  placeholderCard: {
    marginRight: 6,
    borderRadius: 8,
  },
  cardWidth,
  imageHeight,
  cardHeight,

  // LIST VIEW
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  button: {
    width: "45%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    backgroundColor: "#1C1C1C",
  },
  buttonText: {
    color: "#696969",
    fontWeight: "500",
  },
  experiencedSelectedButton: {
    backgroundColor: "#6AB95230",
    borderWidth: 1,
    borderColor: "#6AB95250",
  },
  experiencedSelectedButtonText: {
    color: "#6AB952",
  },
  wishlistedSelectedButton: {
    backgroundColor: "#5FC4ED30",
    borderWidth: 1,
    borderColor: "#5FC4ED50",
  },
  wishlistedSelectedButtonText: {
    color: "#5FC4ED",
  },
  disabledButton: {
    opacity: 0.5,
  },
  instructionText: {
    textAlign: "center",
    marginTop: 20,
    color: "#696969",
  },
});
