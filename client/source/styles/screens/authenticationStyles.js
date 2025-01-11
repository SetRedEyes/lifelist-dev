import { StyleSheet } from "react-native";

export const authenticationStyles = StyleSheet.create({
  // === Authentication Styles === //
  stepTitle: {
    color: "#6AB952",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
    textAlign: "left",
    width: "80%",
  },
  mainTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    width: "80%",
    marginBottom: 8,
  },
  mainSubtitle: {
    width: "85%",
    color: "#fff",
    textAlign: "left",
    marginBottom: 24,
  },
  subtitle: {
    color: "#696969",
    fontSize: 14,
    textAlign: "left",
    width: "80%",
    marginBottom: 24,
  },

  // Sign Up & Login
  container: {
    flex: 1,
    paddingBottom: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: "85%",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  mainLogo: {
    width: 45,
    height: 39,
  },
  title: {
    width: "85%",
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "left",
    marginBottom: 4,
  },
  subtitle: {
    color: "#c7c7c7",
    fontSize: 14,
    textAlign: "left",
    marginBottom: 32,
    marginHorizontal: 42,
  },
  inputWrapper: {
    width: "85%",
    marginBottom: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  leftLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#696969",
    maxWidth: 20, // Limit the width of the line to 20px
    marginRight: 8,
  },
  rightLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#696969",
    maxWidth: 20, // Limit the width of the line to 20px
    marginLeft: 8,
  },
  orText: {
    color: "#696969",
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "85%",
  },
  socialIcon: {
    width: "100%",
    height: 41,
    borderRadius: 4,
    backgroundColor: "#1c1c1c",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  socialText: {
    marginLeft: 6,
    fontWeight: "500",
    color: "#696969",
  },
  googleImage: {
    width: 30,
    height: 30,
  },
  facebookImage: {
    width: 46,
    height: 46,
  },
  appleImage: {
    width: 22,
    height: 26,
    marginBottom: 2,
  },
  signInText: {
    color: "#c7c7c7",
    fontSize: 12,
    marginTop: 48,
  },
  signInLink: {
    color: "#6AB952",
    fontWeight: "700",
  },
  switchText: {
    color: "#696969",
    fontSize: 12,
  },
  switchTypeText: {
    color: "#6AB952",
    fontSize: 12,
    fontWeight: "700",
  },
  greenButton: {
    backgroundColor: "#6AB95230",
    borderColor: "#6AB95250",
    textColor: "#6AB952",
  },
  disabledButton: {
    backgroundColor: "#1c1c1c",
    borderColor: "#1c1c1c",
    textColor: "#696969",
  },

  // Login & Profile Informtion
  topContainer: {
    alignItems: "center",
  },
  stepIndicator: {
    color: "#6AB952",
    marginBottom: 8,
  },
  progressBarContainer: {
    width: "80%",
    height: 4,
    flexDirection: "row",
  },
  progressBarQuarterFill: {
    flex: 0.25,
    backgroundColor: "#6AB952",
    borderRadius: 4,
  },
  progressBarThreeQuarterEmpty: {
    flex: 0.75,
    backgroundColor: "#1c1c1c",
  },
  middleContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 84,
  },
  stepTitle: {
    color: "#6AB952",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
    width: "85%",
  },
  mainTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    width: "85%",
    marginBottom: 4,
  },
  subtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "left",
    width: "85%",
    marginBottom: 24,
  },
  bottomContainer: {
    alignItems: "center",
    marginBottom: 64,
  },
  bottomlogo: {
    width: 48,
    height: 41.6,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
  },

  // Set Profile Picture
  progressBarHalfFill: {
    flex: 0.5,
    backgroundColor: "#6AB952",
    borderRadius: 4,
  },
  progressBarHalfEmpty: {
    flex: 0.5,
    backgroundColor: "#1c1c1c",
  },
  progressBarThreeQuarterFill: {
    flex: 0.75,
    backgroundColor: "#6AB952",
    borderRadius: 4,
  },
  progressBarQuarterEmpty: {
    flex: 0.25,
    backgroundColor: "#1c1c1c",
  },
  square: {
    width: "75%",
    aspectRatio: 1,
    backgroundColor: "#252525",
    borderRadius: 8,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderWidth: 2.5,
    borderColor: "#252525",
    borderRadius: 8,
  },
  placeholderText: {
    color: "#c7c7c7",
    fontSize: 16,
  },

  // Set Permissions
  permissionBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1c1c1c",
  },
  permissionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  permissionTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  permissionSubtitle: {
    color: "#c7c7c7",
    fontSize: 12,
  },
  cameraIcon: {
    width: 32,
    height: 25.3,
  },
  progressBarFullFill: {
    flex: 1,
    backgroundColor: "#6AB952",
    borderRadius: 4,
  },

  footerTextContainer: {
    position: "absolute",
    bottom: 75,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  // Gender Buttons
  genderButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeGenderButton: {
    backgroundColor: "#6AB95230",
    borderWidth: 1,
    borderColor: "#6AB95250",
  },
  genderText: {
    color: "#696969",
    fontWeight: "500",
  },
  activeGenderText: {
    color: "#6AB952",
    fontWeight: "500",
  },
});

export default authenticationStyles;
