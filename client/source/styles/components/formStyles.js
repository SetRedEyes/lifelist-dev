import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  // === Search Bar === //

  searchContainer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 4,
    color: "#fff",
  },

  // === Text Input === //
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    color: "#fff",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#252525",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  placeholderText: {
    color: "#c7c7c7",
  },
  inputText: {
    color: "#fff",
  },
});
