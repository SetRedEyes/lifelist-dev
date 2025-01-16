import { StyleSheet } from "react-native";

export const cameraStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 10,
    borderRadius: 10,
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  emptyStateText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  columnWrapper: {
    justifyContent: "flex-start",
    marginHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
  },
  bottomContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackContainer: {
    position: "absolute",
    top: "50%",
    left: "25%",
    right: "25%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
    padding: 10,
    borderRadius: 8,
  },
  feedbackText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
